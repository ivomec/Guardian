// js/app.js (최종 완성본)
document.addEventListener('DOMContentLoaded', () => {
    const petNameInput = document.getElementById('petName');
    const checkboxContainer = document.getElementById('template-checkboxes');
    const generateBtn = document.getElementById('generate-btn');
    const statusArea = document.getElementById('status-area');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');

    // -- 헬퍼 함수들 (수정 없음) --
    function initializeCheckboxes() { /* 이전과 동일 */ }
    function hasFinalConsonant(name) { /* 이전과 동일 */ }
    function setLoading(isLoading) { /* 이전과 동일 */ }


    // -- 메인 이벤트 리스너 (⭐핵심 수정 부분⭐) --
    generateBtn.addEventListener('click', async () => {
        const selectedCheckboxes = Array.from(checkboxContainer.querySelectorAll('input:checked'));
        if (selectedCheckboxes.length === 0) {
            alert('하나 이상의 안내문을 선택해주세요.');
            return;
        }

        // [수정됨] 이름이 필요한 템플릿이 하나라도 있는지 먼저 확인합니다.
        const needsPetName = selectedCheckboxes.some(cb => {
            const template = allTemplates.find(t => t.id === cb.dataset.templateId);
            return template && template.particle_type; // particle_type이 있으면 이름이 필요한 템플릿
        });

        const petName = petNameInput.value.trim();
        // 이름이 필요한 템플릿이 선택되었는데, 이름이 입력되지 않은 경우에만 경고
        if (needsPetName && petName === '') {
            alert('이름이 필요한 안내문이 선택되었습니다. 환자 이름을 먼저 입력해주세요.');
            petNameInput.focus();
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

                    // [⭐핵심 수정⭐] 
                    // 이름과 조사가 필요한 템플릿인 경우에만 이름 교체 로직을 실행합니다.
                    if (template.particle_type) {
                        const displayName = petName || '우리 아이';
                        let particle = '';
                        if (template.particle_type === '을/를') {
                            particle = hasFinalConsonant(displayName) ? '을' : '를';
                        } else if (template.particle_type === '이/를') {
                            particle = hasFinalConsonant(displayName) ? '이를' : '를';
                        }
                        htmlContent = htmlContent.replace(/\{\{PET_NAME\}\}/g, displayName)
                                                 .replace(/\{\{PARTICLE\}\}/g, particle);
                    }
                    
                    const canvas = await new Promise((resolve, reject) => {
                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'absolute';
                        iframe.style.left = '-9999px';
                        iframe.style.border = 'none';
                        iframe.style.width = '896px';
                        iframe.style.height = '1500px'; 
                        document.body.appendChild(iframe);

                        iframe.onload = () => {
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
                    
                    // 파일 이름은 이름이 없는 경우 '안내문'으로 저장
                    const downloadName = petName || '안내문';
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = `${downloadName}_${template.id}.png`;
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
    // 생략되었던 헬퍼 함수들을 여기에 다시 포함시킵니다.
    function initializeCheckboxes() { generateBtn.disabled = false; allTemplates.forEach(template => { const item = document.createElement('div'); item.className = 'checkbox-item'; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = template.id; checkbox.dataset.templateId = template.id; const label = document.createElement('label'); label.htmlFor = template.id; label.textContent = template.title; item.appendChild(checkbox); item.appendChild(label); checkboxContainer.appendChild(item); }); }
    function hasFinalConsonant(name) { if (!name || typeof name !== 'string') return false; const lastChar = name.charCodeAt(name.length - 1); if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) { return (lastChar - 0xAC00) % 28 !== 0; } return false; }
    function setLoading(isLoading) { generateBtn.disabled = isLoading; btnText.style.display = isLoading ? 'none' : 'block'; spinner.style.display = isLoading ? 'block' : 'none'; }
    
    initializeCheckboxes();
});
