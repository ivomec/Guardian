// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // HTML 요소 가져오기
    const petNameInput = document.getElementById('petName');
    const checkboxContainer = document.getElementById('template-checkboxes');
    const generateBtn = document.getElementById('generate-btn');
    const statusArea = document.getElementById('status-area');
    const renderArea = document.getElementById('render-area');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');

    // 1. templates.js 데이터를 기반으로 체크박스 동적 생성
    function initializeCheckboxes() {
        allTemplates.forEach(template => {
            const item = document.createElement('div');
            item.className = 'checkbox-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = template.id;
            checkbox.dataset.templateId = template.id;

            const label = document.createElement('label');
            label.htmlFor = template.id;
            label.textContent = template.title;

            item.appendChild(checkbox);
            item.appendChild(label);
            checkboxContainer.appendChild(item);
        });
    }

    // 2. 환자 이름 입력에 따라 버튼 활성화/비활성화
    petNameInput.addEventListener('input', () => {
        if (petNameInput.value.trim() !== '') {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    });

    // 3. 생성 버튼 클릭 이벤트 (개별 이미지 다운로드 로직으로 변경)
    generateBtn.addEventListener('click', async () => {
        const petName = petNameInput.value.trim();
        const selectedCheckboxes = Array.from(checkboxContainer.querySelectorAll('input[type="checkbox"]:checked'));

        if (selectedCheckboxes.length === 0) {
            alert('하나 이상의 안내문을 선택해주세요.');
            return;
        }

        // 버튼 로딩 상태로 변경
        setLoading(true);

        // 선택된 각 안내문에 대해 반복 작업 수행
        for (let i = 0; i < selectedCheckboxes.length; i++) {
            const checkbox = selectedCheckboxes[i];
            const templateId = checkbox.dataset.templateId;
            const template = allTemplates.find(t => t.id === templateId);

            if (template) {
                statusArea.textContent = `(${i + 1}/${selectedCheckboxes.length}) ${template.title} 이미지 생성 및 다운로드 중...`;

                // HTML 렌더링
                renderArea.innerHTML = template.generateHtml(petName);

                // html2canvas로 이미지 생성
                const canvas = await html2canvas(renderArea.firstElementChild, {
                    scale: 1.5, // 이미지 품질 향상
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                // 캔버스 데이터를 사용해 다운로드 링크 생성 및 클릭
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `${petName}_${template.id}.png`; // 파일 이름 지정 (예: 사랑이_가바펜틴.png)
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // 브라우저가 여러 파일 다운로드를 처리할 수 있도록 짧은 지연 추가
                if (i < selectedCheckboxes.length - 1) {
                   await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        // 버튼 상태 원상 복구 및 완료 메시지 표시
        setLoading(false);
        statusArea.textContent = '✅ 모든 이미지 다운로드가 완료되었습니다!';
        setTimeout(() => { statusArea.textContent = ''; }, 5000);
    });

    // 버튼 로딩 상태를 관리하는 함수
    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'block';
        } else {
            generateBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    }

    // 초기화 함수 실행
    initializeCheckboxes();
});