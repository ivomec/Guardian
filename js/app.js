// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // HTML 요소들은 그대로 유지됩니다.
    const petNameInput = document.getElementById('petName');
    const checkboxContainer = document.getElementById('template-checkboxes');
    const generateBtn = document.getElementById('generate-btn');
    const statusArea = document.getElementById('status-area');
    // renderArea는 이제 직접 사용하지 않습니다.
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');

    function initializeCheckboxes() { /* ... 이전과 동일 ... */ }
    function hasFinalConsonant(name) { /* ... 이전과 동일 ... */ }
    function setLoading(isLoading) { /* ... 이전과 동일 ... */ }

    // initializeCheckboxes, hasFinalConsonant, setLoading 함수는 이전과 동일하게 유지합니다.
    // (위에 생략된 부분은 기존 코드를 그대로 사용하시면 됩니다)

    // [수정됨] 이미지 생성 로직 전체를 iframe 방식으로 변경합니다.
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
                    if (!response.ok) throw new Error(`파일을 불러오지 못했습니다: ${response.statusText}`);
                    let htmlContent = await response.text();

                    // Step 2: 자리표시자를 실제 이름으로 교체하기
                    const displayName = petName || '우리 아이';
                    let particle = '';
                    if (template.particle_type === '을/를') {
                        particle = hasFinalConsonant(displayName) ? '을' : '를';
                    } else if (template.particle_type === '이/를') {
                        particle = hasFinalConsonant(displayName) ? '이를' : '를';
                    }
                    htmlContent = htmlContent.replace(/\{\{PET_NAME\}\}/g, displayName)
                                             .replace(/\{\{PARTICLE\}\}/g, particle);
                    
                    // Step 3: 보이지 않는 iframe을 만들어 캡처 실행
                    const canvas = await new Promise((resolve, reject) => {
                        const iframe = document.createElement('iframe');
                        iframe.style.position = 'absolute';
                        iframe.style.left = '-9999px'; // 화면 밖에 위치
                        iframe.style.border = 'none';
                        // iframe의 너비를 캡처할 요소의 최대 너비와 유사하게 설정
                        iframe.style.width = '896px'; // max-w-4xl (896px)
                        iframe.style.height = '1500px'; // 충분한 높이

                        document.body.appendChild(iframe);

                        iframe.onload = () => {
                            const captureTarget = iframe.contentDocument.querySelector('#captureArea');
                            if (!captureTarget) {
                                document.body.removeChild(iframe);
                                reject(new Error('템플릿에서 캡처할 요소를 찾지 못했습니다. (id="captureArea" 확인 필요)'));
                                return;
                            }
                            
                            html2canvas(captureTarget, {
                                scale: 1.5,
                                useCORS: true,
                                backgroundColor: null, // iframe의 배경을 따르도록 null로 설정
                                width: captureTarget.offsetWidth,
                                height: captureTarget.offsetHeight,
                                windowWidth: captureTarget.scrollWidth,
                                windowHeight: captureTarget.scrollHeight
                            }).then(canvas => {
                                document.body.removeChild(iframe); // 캡처 후 iframe 제거
                                resolve(canvas);
                            }).catch(err => {
                                document.body.removeChild(iframe);
                                reject(err);
                            });
                        };

                        // iframe에 내용 삽입
                        iframe.srcdoc = htmlContent;
                    });
                    
                    // Step 4: 다운로드 링크 생성
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

    // 여기에 생략된 initializeCheckboxes, hasFinalConsonant, setLoading 함수를 붙여넣으세요.
    function initializeCheckboxes() {generateBtn.disabled = false;allTemplates.forEach(template => {const item = document.createElement('div');item.className = 'checkbox-item';const checkbox = document.createElement('input');checkbox.type = 'checkbox';checkbox.id = template.id;checkbox.dataset.templateId = template.id;const label = document.createElement('label');label.htmlFor = template.id;label.textContent = template.title;item.appendChild(checkbox);item.appendChild(label);checkboxContainer.appendChild(item);});}
    function hasFinalConsonant(name) {if (!name || typeof name !== 'string') return false;const lastChar = name.charCodeAt(name.length - 1);if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) {return (lastChar - 0xAC00) % 28 !== 0;}return false;}
    function setLoading(isLoading) {generateBtn.disabled = isLoading;btnText.style.display = isLoading ? 'none' : 'block';spinner.style.display = isLoading ? 'block' : 'none';}

    initializeCheckboxes();
});
