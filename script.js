document.addEventListener('DOMContentLoaded', () => {

    // --- 기본 설정 ---
    const petNameInput = document.getElementById('petNameInput');
    const dateDisplay = document.getElementById('dateDisplay');
    const tabNav = document.getElementById('tabNav');
    const tabContent = document.getElementById('tabContent');
    const saveOptionsContainer = document.getElementById('saveOptionsContainer');
    const saveSelectedBtn = document.getElementById('saveSelectedBtn');

    // 불러올 탭 목록과 각 탭에서 이미자로 저장할 특정 영역 지정
    const TABS_CONFIG = [
        { id: 'gabapentin', title: '가바펜틴 안내문', file: '가바펜틴 진정 약물 안내문.html', captureSelector: '#captureArea' },
        { id: 'dog-dental', title: '강아지 양치', file: '강아지 양치.html', captureSelector: '.container' },
        { id: 'cat-dental', title: '고양이 양치', file: '고양이 양치.html', captureSelector: '.container' },
        { id: 'alveolar-bone', title: '치조골 팽윤', file: '고양이 치조골 팽윤.html', captureSelector: '#explainerContent' }
    ];

    // --- 초기화 함수 실행 ---
    initializeDashboard();
    
    // --- 기능별 함수 정의 ---

    /**
     * 대시보드 전체를 초기화하는 함수
     */
    async function initializeDashboard() {
        displayCurrentDate();
        await loadTabs();
        setupEventListeners();
    }

    /**
     * 현재 날짜를 상단에 표시하는 함수
     */
    function displayCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const day = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
        dateDisplay.textContent = `${year}년 ${month}월 ${date}일 (${day}요일)`;
    }
    
    /**
     * TABS_CONFIG에 정의된 모든 탭의 콘텐츠를 비동기 로드
     */
    async function loadTabs() {
        showLoader(true);
        const fetchPromises = TABS_CONFIG.map(async (tab, index) => {
            // 1. 탭 버튼 생성
            const button = document.createElement('button');
            button.className = `tab-btn p-4 font-bold border-b-2 border-transparent text-slate-500 hover:bg-slate-200 ${index === 0 ? 'active' : ''}`;
            button.textContent = tab.title;
            button.dataset.tabId = tab.id;
            tabNav.appendChild(button);

            // 2. 탭 콘텐츠를 담을 패널 생성
            const panel = document.createElement('div');
            panel.id = `content-${tab.id}`;
            panel.className = `tab-panel ${index === 0 ? 'active' : ''}`;
            tabContent.appendChild(panel);

            // 3. HTML 파일 fetch 및 패널에 내용 삽입
            try {
                const response = await fetch(tab.file);
                if (!response.ok) throw new Error(`'${tab.file}' 로드 실패`);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // body의 자식 요소들만 패널에 추가 (중복 body, head 태그 방지)
                panel.append(...doc.body.children);
                executePanelScripts(panel); // 로드된 HTML 내의 스크립트 실행
            } catch (error) {
                panel.innerHTML = `<p class="text-red-500 text-center p-8">${error.message}</p>`;
            }
             // 4. 저장 옵션 체크박스 생성
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'flex items-center bg-gray-50 p-2 rounded-md border';
            checkboxDiv.innerHTML = `
                <input type="checkbox" id="save-check-${tab.id}" data-tab-id="${tab.id}" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <label for="save-check-${tab.id}" class="ml-2 block text-sm font-medium text-gray-700 truncate">${tab.title}</label>
            `;
            saveOptionsContainer.appendChild(checkboxDiv);
        });

        await Promise.all(fetchPromises);
        showLoader(false);
        updateAllPatientNames(); // 초기 이름 업데이트
    }

    /**
     * 로드된 패널 내부의 스크립트를 찾아 실행하는 함수
     * @param {HTMLElement} panel 
     */
    function executePanelScripts(panel) {
        panel.querySelectorAll('script').forEach(oldScript => {
            const newScript = document.createElement('script');
            // 스크립트 속성을 복사합니다. (src, type 등)
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            // 인라인 스크립트의 경우 내용을 복사합니다.
            if(oldScript.innerHTML) {
                newScript.innerHTML = oldScript.innerHTML;
            }
            // 스크립트를 DOM에 다시 추가하여 실행시킵니다.
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    /**
     * 모든 이벤트 리스너를 설정하는 함수
     */
    function setupEventListeners() {
        // 탭 전환 이벤트
        tabNav.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn')) {
                const tabId = e.target.dataset.tabId;
                switchTab(tabId);
            }
        });

        // 환자 이름 입력 시 실시간 연동
        petNameInput.addEventListener('input', updateAllPatientNames);
        
        // 선택한 안내문 저장 이벤트
        saveSelectedBtn.addEventListener('click', saveSelectedImages);
    }
    
    /**
     * 지정된 ID의 탭으로 화면을 전환하는 함수
     * @param {string} tabId 
     */
    function switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        document.querySelector(`.tab-btn[data-tab-id="${tabId}"]`).classList.add('active');
        document.getElementById(`content-${tabId}`).classList.add('active');
    }

    /**
     * 모든 탭의 환자 이름 플레이스홀더를 업데이트하는 함수
     */
    function updateAllPatientNames() {
        const name = petNameInput.value.trim();
        const hasJongseong = name ? hasFinalConsonant(name) : false;
        
        // 가바펜틴 안내문 제목 (고유 ID 사용)
        const gabaTitle = document.getElementById('mainTitle');
        if (gabaTitle) {
            if (name) {
                gabaTitle.innerHTML = `<span>${name}</span><span>${hasJongseong ? '이를' : '를'}</span> 위한 편안한 진료 준비 안내서`;
            } else {
                gabaTitle.innerHTML = `<span>우리 아이</span><span>를</span> 위한 편안한 진료 준비 안내서`;
            }
        }

        // 치조골 팽윤 안내문 (클래스 사용)
        const bonePlaceholders = document.querySelectorAll('.patient-name-placeholder');
        bonePlaceholders.forEach(el => {
            if (name) {
                // 특정 구문에 따라 조사 변경
                if (el.nextElementSibling && (el.nextElementSibling.textContent.startsWith('을') || el.nextElementSibling.textContent.startsWith('를'))) {
                    el.textContent = name;
                    el.nextElementSibling.textContent = hasJongseong ? '이를 고통에서...' : '를 고통에서...';
                } else if (el.textContent.includes('의')) {
                    el.textContent = `${name}의`;
                }
                 else {
                    el.textContent = name;
                }
            } else {
                 el.textContent = '[환자이름]';
            }
        });
        
        // 치조골 팽윤의 복잡한 문장 구조를 위한 별도 처리
        document.querySelectorAll('p, strong').forEach(p => {
            if (p.innerHTML.includes('가 더 이상 아프지 않고')) {
                const particle = hasJongseong ? '이가' : '가';
                p.innerHTML = p.innerHTML.replace(/\[환자이름\](이|가) 더 이상 아프지 않고/g, `<span class="patient-name-placeholder">${name || '[환자이름]'}</span>${name ? particle : '가'} 더 이상 아프지 않고`);
            }
        });
    }
    
    /**
     * 한글 마지막 글자의 받침 유무를 확인하는 함수
     * @param {string} str 
     * @returns {boolean}
     */
    function hasFinalConsonant(str) {
        const lastChar = str.charCodeAt(str.length - 1);
        // 한글 범위(가-힣) 내에서만 계산
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
            return (lastChar - 0xAC00) % 28 !== 0;
        }
        return false;
    }

    /**
     * 선택된 탭들을 고품질 이미지로 저장하는 함수
     */
    async function saveSelectedImages() {
        const selectedCheckboxes = Array.from(document.querySelectorAll('#saveOptionsContainer input[type="checkbox"]:checked'));
        if (selectedCheckboxes.length === 0) {
            alert('저장할 안내문을 1개 이상 선택해주세요.');
            return;
        }

        const petName = petNameInput.value.trim() || '환자';
        const originalButtonText = saveSelectedBtn.querySelector('span').textContent;
        setButtonLoadingState(true);

        for (const checkbox of selectedCheckboxes) {
            const tabId = checkbox.dataset.tabId;
            const config = TABS_CONFIG.find(t => t.id === tabId);
            if (!config) continue;

            const contentPanel = document.getElementById(`content-${tabId}`);
            const captureElement = contentPanel.querySelector(config.captureSelector);

            if (captureElement) {
                try {
                    const canvas = await html2canvas(captureElement, {
                        scale: 2.5, // 품질 향상을 위해 스케일 조정
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        windowWidth: captureElement.scrollWidth,
                        windowHeight: captureElement.scrollHeight,
                        onclone: (clonedDoc) => {
                            // 복제된 문서에서 이름 필드의 현재 값을 유지
                             const clonedPetNameInput = clonedDoc.getElementById('petNameInput');
                             if(clonedPetNameInput) {
                               clonedPetNameInput.value = petNameInput.value;
                             }
                        }
                    });
                    const link = document.createElement('a');
                    link.download = `${petName}_${config.title}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    await new Promise(resolve => setTimeout(resolve, 200)); // 다음 다운로드를 위한 짧은 지연
                } catch (error) {
                    console.error(`${config.title} 저장 중 오류 발생:`, error);
                    alert(`${config.title} 안내문을 이미지로 저장하는 데 실패했습니다.`);
                }
            }
        }
        setButtonLoadingState(false, originalButtonText);
    }

    /**
     * 로딩 상태 UI를 제어하는 함수
     * @param {boolean} isLoading 
     * @param {string} [buttonText] 
     */
    function setButtonLoadingState(isLoading, buttonText) {
        const buttonSpan = saveSelectedBtn.querySelector('span');
        if (isLoading) {
            saveSelectedBtn.disabled = true;
            saveSelectedBtn.classList.add('opacity-70', 'cursor-not-allowed');
            buttonSpan.textContent = '저장 중...';
        } else {
            saveSelectedBtn.disabled = false;
            saveSelectedBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            if (buttonText) buttonSpan.textContent = buttonText;
        }
    }

    /**
     * 탭 로딩 중 스피너 표시/숨김 함수
     * @param {boolean} show 
     */
    function showLoader(show) {
        if (show && !document.querySelector('.loader')) {
            const loader = document.createElement('div');
            loader.className = 'loader';
            tabContent.appendChild(loader);
        } else {
            const loader = document.querySelector('.loader');
            if (loader) loader.remove();
        }
    }
});
