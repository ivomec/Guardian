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
        generateBtn.disabled = false; // 페이지 로드 시 버튼 활성화

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

    // 받침 유무 확인 함수
    function hasFinalConsonant(name) {
        if (!name || typeof name !== 'string') return false;
        const lastChar = name.charCodeAt(name.length - 1);
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) { // 한글 범위 체크
            return (lastChar - 0xAC00) % 28 !== 0;
        }
        return false;
    }

    // 2. 생성 버튼 클릭 이벤트
    generateBtn.addEventListener('click', async () => {
        const petName = petNameInput.value.trim();

        if (petName === '') {
            alert('환자 이름을 먼저 입력해주세요.');
            petNameInput.focus();
            return;
        }

        const selectedCheckboxes = Array.from(checkboxContainer.querySelectorAll('input:checked'));

        if (selectedCheckboxes.length === 0) {
            alert('하나 이상의 안내문을 선택해주세요.');
            return;
        }

        setLoading(true);

        for (let i = 0; i < selectedCheckboxes.length; i++) {
            const checkbox = selectedCheckboxes[i];
            const templateId = checkbox.dataset.templateId;
            const template = allTemplates.find(t => t.id === templateId);

            if (template) {
                statusArea.textContent = `(${i + 1}/${selectedCheckboxes.length}) ${template.title} 생성 중...`;
                
                try {
                    // Step 1: 템플릿 HTML 파일을 텍스트로 불러오기
                    const response = await fetch(template.path);
                    if (!response.ok) { // 통신 실패 시 에러 처리
                        throw new Error(`파일을 불러오지 못했습니다: ${response.statusText}`);
                    }
                    let htmlContent = await response.text();

                    // Step 2: 자리표시자를 실제 이름으로 교체하기
                    const displayName = petName || '우리 아이';
                    let particle = '';
                    if (template.particle_type === '을/를') {
                        particle = hasFinalConsonant(displayName) ? '을' : '를';
                    } else if (template.particle_type === '이/를') {
                        particle = hasFinalConsonant(displayName) ? '이를' : '를';
                    }
                    
                    htmlContent = htmlContent.replace('{{PET_NAME}}', displayName)
                                             .replace('{{PARTICLE}}', particle);
                    
                    // Step 3: 수정된 HTML을 렌더링 영역에 삽입
                    renderArea.innerHTML = htmlContent;

                    // Step 4: 캡처할 대상을 '#captureArea' ID로 명확하게 지정 (⭐핵심 수정 부분⭐)
                    const captureTarget = renderArea.querySelector('#captureArea'); 
                    
                    if (!captureTarget) {
                        throw new Error('템플릿에서 캡처할 유효한 요소를 찾지 못했습니다. (id="captureArea" 확인 필요)');
                    }
                    
                    const canvas = await html2canvas(captureTarget, {
                        scale: 1.5,
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    });
                    
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `${petName}_${template.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                } catch (error) {
                    console.error('이미지 생성 중 오류 발생:', error);
                    alert(`${template.title} 안내문 생성에 실패했습니다. 오류: ${error.message}`);
                }

                if (i < selectedCheckboxes.length - 1) {
                   await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        setLoading(false);
        statusArea.textContent = '✅ 모든 이미지 다운로드가 완료되었습니다!';
        setTimeout(() => { statusArea.textContent = ''; }, 5000);
    });

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'block';
        spinner.style.display = isLoading ? 'block' : 'none';
    }

    initializeCheckboxes();
});
