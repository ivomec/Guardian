document.addEventListener('DOMContentLoaded', function () {
    // --- DOM 요소 가져오기 ---
    const petNameInput = document.getElementById('petName');
    const visitDateInput = document.getElementById('visitDate'); // 날짜 입력 필드
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveBtn = document.getElementById('saveBtn');
    const saveOptionsContainer = document.getElementById('save-options');

    // --- 이름 및 조사 관련 요소 ---
    const namePlaceholders = document.querySelectorAll('.patient-name-placeholder');
    const gabapentinTitle = document.getElementById('gabapentinTitle');
    const particlesEulReul = document.querySelectorAll('.particle-eul, .particle-reul');
    const particlesIGa = document.querySelectorAll('.particle-i, .particle-ga');

    /**
     * 한글 이름의 마지막 글자에 받침(종성)이 있는지 확인하는 함수
     * @param {string} name - 확인할 이름 문자열
     * @returns {boolean} - 받침이 있으면 true, 없으면 false
     */
    function hasFinalConsonant(name) {
        if (!name || typeof name !== 'string') return false;
        const lastChar = name.charCodeAt(name.length - 1);
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
            return (lastChar - 0xAC00) % 28 !== 0;
        }
        return false;
    }

    /**
     * 입력된 환자 이름에 맞춰 모든 안내문의 이름과 조사를 업데이트하는 함수
     */
    function updateAllPlaceholders() {
        const name = petNameInput.value.trim();
        const hasConsonant = hasFinalConsonant(name);

        if (name) {
            namePlaceholders.forEach(el => el.textContent = name);
            gabapentinTitle.innerHTML = `<span>${name}</span><span class="particle-eul">${hasConsonant ? '이를' : '를'}</span> 위한 편안한 진료 준비 안내서`;
            particlesEulReul.forEach(el => el.textContent = hasConsonant ? '을' : '를');
            particlesIGa.forEach(el => el.textContent = hasConsonant ? '이' : '가');
        } else {
            document.querySelectorAll('#alveolar-bone .patient-name-placeholder, #cat-dental .patient-name-placeholder, #dog-dental .patient-name-placeholder').forEach(el => {
                const defaultText = {
                    '[환자이름]': '[환자이름]',
                    '우리 아이': '우리 아이',
                    '마음': '마음'
                }[el.dataset.default] || '우리 아이'; // data-default 속성을 기반으로 기본값 설정
                if(el.closest('#alveolar-bone')) el.textContent = '[환자이름]';
                else if(el.closest('#dog-dental')) el.textContent = '우리 아이';
                else if(el.closest('#cat-dental')) el.textContent = '마음';
                else el.textContent = '우리 아이';
            });
            gabapentinTitle.innerHTML = `<span>우리 아이</span><span class="particle-eul">를</span> 위한 편안한 진료 준비 안내서`;
            particlesEulReul.forEach(el => el.textContent = '를');
            particlesIGa.forEach(el => el.textContent = '가');
        }
    }

    /**
     * 탭 버튼 클릭 시 해당 콘텐츠를 보여주는 함수
     */
    function switchTab(event) {
        const targetId = event.currentTarget.dataset.target;
        tabButtons.forEach(button => button.classList.toggle('active', button.dataset.target === targetId));
        tabContents.forEach(content => content.classList.toggle('active', content.id === targetId));
    }

    /**
     * 날짜 입력 필드의 값이 바뀔 때, CSS 클래스를 조절하여 플레이스홀더 스타일을 관리하는 함수
     */
    function handleDateInputStyle() {
        if (visitDateInput.value) {
            visitDateInput.classList.add('has-value');
        } else {
            visitDateInput.classList.remove('has-value');
        }
    }

    /**
     * 선택된 탭들을 고해상도 이미지로 저장하는 함수 (파일명에 날짜 추가)
     */
    async function saveSelectedAsImages() {
        // 1. 환자 이름과 날짜 가져오기
        const petName = petNameInput.value.trim() || '환자';
        const visitDateValue = visitDateInput.value;

        if (!visitDateValue) {
            alert("방문 날짜를 선택해주세요. 파일 이름에 날짜가 포함됩니다.");
            visitDateInput.focus();
            return;
        }
        
        // 날짜 포맷 변경: 'YYYY-MM-DD' -> 'YYMMDD'
        const datePrefix = visitDateValue.substring(2).replace(/-/g, '');

        // 2. 저장할 안내문 선택 확인
        const checkedOptions = saveOptionsContainer.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedOptions.length === 0) {
            alert("저장할 안내문을 1개 이상 선택해주세요.");
            return;
        }

        const fileNameMap = {
            'gabapentin': '가바펜틴_안내문',
            'dog-dental': '강아지_양치_가이드',
            'cat-dental': '고양이_양치_가이드',
            'alveolar-bone': '치조골_팽윤_안내문'
        };

        // 3. 이미지 생성 및 저장 시작
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-3"></i> 이미지 생성 중...`;

        for (const checkbox of checkedOptions) {
            const targetId = checkbox.dataset.target;
            const captureArea = document.getElementById(targetId);
            if (!captureArea) continue;

            try {
                const canvas = await html2canvas(captureArea, {
                    scale: 2.5,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    windowWidth: captureArea.scrollWidth,
                    windowHeight: captureArea.scrollHeight,
                });

                const link = document.createElement('a');
                const fileNameBase = fileNameMap[targetId] || targetId;
                
                // 파일명 형식: YYMMDD_환자이름_안내문이름.png
                link.download = `${datePrefix}_${petName}_${fileNameBase}.png`;
                
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error(`'${targetId}' 안내문 저장 중 오류 발생:`, error);
                alert(`'${targetId}' 안내문을 이미지로 저장하는 데 실패했습니다.`);
            }
        }
        
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fas fa-camera-retro mr-3"></i> 선택한 안내문 모두 이미지로 저장`;
        alert("선택한 안내문 저장이 완료되었습니다.");
    }

    // --- 이벤트 리스너 등록 ---
    petNameInput.addEventListener('input', updateAllPlaceholders);
    visitDateInput.addEventListener('change', handleDateInputStyle); // 날짜 변경 시 스타일 업데이트
    tabButtons.forEach(button => button.addEventListener('click', switchTab));
    saveBtn.addEventListener('click', saveSelectedAsImages);
    
    // --- 페이지 로드 시 초기 상태 설정 ---
    function initialize() {
        // 오늘 날짜를 기본값으로 설정
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        visitDateInput.value = `${year}-${month}-${day}`;
        
        handleDateInputStyle(); // 초기 날짜 스타 일 적용
        updateAllPlaceholders(); // 초기 이름 적용
    }

    initialize();
});
