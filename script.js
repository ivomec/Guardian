document.addEventListener('DOMContentLoaded', function () {
    // --- DOM 요소 가져오기 ---
    const petNameInput = document.getElementById('petName');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveBtn = document.getElementById('saveBtn');
    const saveOptionsContainer = document.getElementById('save-options');

    // --- 이름 및 조사 관련 요소 ---
    const namePlaceholders = document.querySelectorAll('.patient-name-placeholder');
    const gabapentinTitle = document.getElementById('gabapentinTitle');

    // 조사(particle)를 위한 span 요소들
    const particlesEulReul = document.querySelectorAll('.particle-eul, .particle-reul'); // ~을/를
    const particlesIGa = document.querySelectorAll('.particle-i, .particle-ga');         // ~이/가
    // '.particle-ui' (~의) 는 변하지 않으므로 직접 제어할 필요 없음

    /**
     * 한글 이름의 마지막 글자에 받침(종성)이 있는지 확인하는 함수
     * @param {string} name - 확인할 이름 문자열
     * @returns {boolean} - 받침이 있으면 true, 없으면 false
     */
    function hasFinalConsonant(name) {
        if (!name || typeof name !== 'string') return false;
        const lastChar = name.charCodeAt(name.length - 1);
        // 한글 음절 범위(0xAC00 ~ 0xD7A3)에 있는지 확인
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
            // (마지막 글자 코드 - '가' 코드) % 28이 0이 아니면 종성이 있음
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
            // 이름이 있을 경우
            // 1. 모든 '.patient-name-placeholder'를 환자 이름으로 변경
            namePlaceholders.forEach(el => el.textContent = name);

            // 2. 가바펜틴 안내문 제목 특별 처리
            gabapentinTitle.innerHTML = `<span>${name}</span><span class="particle-eul">${hasConsonant ? '이를' : '를'}</span> 위한 편안한 진료 준비 안내서`;

            // 3. 각 조사 업데이트
            particlesEulReul.forEach(el => el.textContent = hasConsonant ? '을' : '를');
            particlesIGa.forEach(el => el.textContent = hasConsonant ? '이' : '가');

        } else {
            // 이름이 없을 경우, 기본값으로 되돌리기
            // 1. placeholder 기본값 설정
            document.querySelectorAll('#alveolar-bone .patient-name-placeholder').forEach(el => el.textContent = '[환자이름]');
            document.querySelectorAll('#dog-dental .patient-name-placeholder').forEach(el => el.textContent = '우리 아이');
            document.querySelectorAll('#cat-dental .patient-name-placeholder').forEach(el => el.textContent = '마음');
            
            // 2. 가바펜틴 제목 기본값 설정
            gabapentinTitle.innerHTML = `<span>우리 아이</span><span class="particle-eul">를</span> 위한 편안한 진료 준비 안내서`;
            
            // 3. 특정 placeholder 세부 조정
            const alveolarTitleName = document.querySelector('#alveolar-bone header .patient-name-placeholder');
            if(alveolarTitleName) alveolarTitleName.textContent = '[환자이름]';

            const dogDentalTitleName = document.querySelector('#dog-dental .header .patient-name-placeholder');
            if(dogDentalTitleName) dogDentalTitleName.textContent = '우리 아이';
            
            // 4. 조사 기본값 설정
            particlesEulReul.forEach(el => el.textContent = '를');
            particlesIGa.forEach(el => el.textContent = '가');
        }
    }

    /**
     * 탭 버튼 클릭 시 해당 콘텐츠를 보여주는 함수
     * @param {Event} event - 클릭 이벤트 객체
     */
    function switchTab(event) {
        const targetId = event.currentTarget.dataset.target;
        
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.target === targetId);
        });

        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetId);
        });
    }

    /**
     * 선택된 탭들을 고해상도 이미지로 저장하는 함수
     */
    async function saveSelectedAsImages() {
        const petName = petNameInput.value.trim() || '환자';
        const checkedOptions = saveOptionsContainer.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkedOptions.length === 0) {
            alert("저장할 안내문을 1개 이상 선택해주세요.");
            return;
        }

        // 사용자 친화적인 파일 이름 매핑
        const fileNameMap = {
            'gabapentin': '가바펜틴_안내문',
            'dog-dental': '강아지_양치_가이드',
            'cat-dental': '고양이_양치_가이드',
            'alveolar-bone': '치조골_팽윤_안내문'
        };

        // 저장 버튼 비활성화 (중복 클릭 방지)
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-3"></i> 이미지 생성 중...`;

        for (const checkbox of checkedOptions) {
            const targetId = checkbox.dataset.target;
            const captureArea = document.getElementById(targetId);
            
            if (!captureArea) continue;

            try {
                const canvas = await html2canvas(captureArea, {
                    scale: 2.5, // 해상도 향상을 위해 scale 값 증가
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    // 스크롤 영역 전체를 캡쳐하기 위한 설정
                    windowWidth: captureArea.scrollWidth,
                    windowHeight: captureArea.scrollHeight,
                });

                const link = document.createElement('a');
                const fileNameBase = fileNameMap[targetId] || targetId;
                link.href = canvas.toDataURL('image/png');
                link.download = `${petName}_${fileNameBase}.png`;
                link.click();

            } catch (error) {
                console.error(`'${targetId}' 안내문 저장 중 오류 발생:`, error);
                alert(`'${targetId}' 안내문을 이미지로 저장하는 데 실패했습니다. 다시 시도해주세요.`);
            }
        }
        
        // 저장 버튼 다시 활성화
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fas fa-camera-retro mr-3"></i> 선택한 안내문 모두 이미지로 저장`;
        alert("선택한 안내문 저장이 완료되었습니다.");
    }

    // --- 이벤트 리스너 등록 ---
    petNameInput.addEventListener('input', updateAllPlaceholders);
    tabButtons.forEach(button => button.addEventListener('click', switchTab));
    saveBtn.addEventListener('click', saveSelectedAsImages);
    
    // 페이지 로드 시 초기 상태 설정
    updateAllPlaceholders();
});