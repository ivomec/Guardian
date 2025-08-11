// js/app.js (최종 완성본)
document.addEventListener('DOMContentLoaded', () => {
    const petNameInput = document.getElementById('petName');
    const checkboxContainer = document.getElementById('template-checkboxes');
    const generateBtn = document.getElementById('generate-btn');
    const statusArea = document.getElementById('status-area');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');

    // -- 헬퍼 함수들 --

    // 1. 대시보드 초기화 함수
    function initializeCheckboxes() {
        generateBtn.disabled = false;
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

    // 2. 이름 받침 확인 함수
    function hasFinalConsonant(name) {
        if (!name || typeof name !== 'string') return false;
        const lastChar = name.charCodeAt(name.length - 1);
        if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {
            return (lastChar - 0xAC00) % 28 !== 0;
        }
        return false;
    }

    // 3. 버튼 로딩 상태 변경 함수
    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        btnText.style.display = isLoading ? 'none' : 'block';
        spinner.style.display = isLoading ? 'block' : 'none';
    }


    // -- 메인 이벤트 리스너 --

    generateBtn.addEventListener('click', async () => {
        const petName = petNameInput.value.trim();
        if (petName === '') {
            alert('환자 이름을 먼저 입력해주세요');
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
                    const response = await fetch(template.path);
                    if (!response.ok) throw new Error(`파일 로드 실패: ${response.statusText}`);
                    let htmlContent = await response.text();

                    const displayName = petName || '우리 아이';
                    let particle = '';
                    if (template.particle_type === '을/를') {
                        particle = hasFinalConsonant(displayName) ? '을' : '를';
                    } else if (template.particle_type === '이/를') {
                        particle = hasFinalConsonant(displayName) ? '이를' : '를';
                    }
                    htmlContent = htmlContent.replace(/\{\{PET_NAME\}\}/g, displayName)
                                             .replace(/\{\{PARTICLE\}\}/g, particle);
                    
                    const canvas = await new Promise((resolve, reject) => {
                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'absolute';
                        iframe.style.left = '-9999px';
                        iframe.style.border = 'none';
                        iframe.style.width = '896px';
                        iframe.style.height = '1500px'; 
                        document.body.appendChild(iframe);

                        iframe.onload = () => {
                            // 폰트와 아이콘이 로드될 시간을 벌기 위해 1초 대기
                            setTimeout(() => {
                                const captureTarget = iframe.contentDocument.querySelector('#captureArea');
                                if (!captureTarget) {
                                    document.body.removeChild(iframe);
                                    reject(new Error('템플릿에서 #captureArea 요소를 찾지 못했습니다.'));
                                    return;
                                }
                                
                                html2canvas(captureTarget, {
                                    scale: 1.5,
                                    useCORS: true,
                                    backgroundColor: null,
                                }).then(canvas => {
                                    document.body.removeChild(iframe);
                                    resolve(canvas);
                                }).catch(err => {
                                    document.body.removeChild(iframe);
                                    reject(err);
                                });
                            }, 1000); // 1초 대기
                        };
                        
                        iframe.srcdoc = htmlContent;
                    });
                    
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `${petName}_${template.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                } catch (error) {
                    console.error('이미지 생성 중 오류 발생:', error);
                    alert(`${template.title} 안내문 생성에 실패했습니다: ${error.message}`);
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

    // -- 대시보드 실행 --
    initializeCheckboxes();
});
