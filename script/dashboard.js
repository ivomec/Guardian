document.addEventListener('DOMContentLoaded', async () => {
    // DOM 요소 가져오기
    const petNameInput = document.getElementById('petName');
    const dateInput = document.getElementById('currentDate');
    const timeInput = document.getElementById('currentTime');
    const templateListContainer = document.getElementById('template-list');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btn-text');
    let TEMPLATE_CONFIG = {};

    // --- 초기화 함수 ---
    async function initialize() {
        // 1. JSON 설정 파일 불러오기
        try {
            const response = await fetch('./data/templates.json');
            if (!response.ok) throw new Error('data/templates.json 파일을 불러올 수 없습니다.');
            const templates = await response.json();
            
            // 불러온 설정을 전역 설정 객체로 변환
            TEMPLATE_CONFIG = templates.reduce((acc, tpl) => {
                acc[tpl.id] = tpl;
                return acc;
            }, {});

            renderTemplateCheckboxes(templates);
        } catch (error) {
            templateListContainer.innerHTML = `<p class="text-red-500 font-bold">${error.message}</p>`;
            console.error(error);
        }

        // 2. 날짜/시간 기본값 설정
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dateInput.value = now.toISOString().slice(0, 10);
        timeInput.value = now.toISOString().slice(11, 16);

        // 3. 이벤트 리스너 연결
        generateBtn.addEventListener('click', onGenerateClick);
    }

    // --- UI 렌더링 함수 ---
    function renderTemplateCheckboxes(templates) {
        templateListContainer.innerHTML = ''; // 로딩 메시지 제거
        if (templates.length === 0) {
            templateListContainer.innerHTML = '<p class="text-slate-500">등록된 안내문이 없습니다.</p>';
            return;
        }
        templates.forEach(template => {
            const div = document.createElement('div');
            div.className = 'flex items-center bg-white p-3 rounded-lg border';
            div.innerHTML = `
                <input id="chk-${template.id}" type="checkbox" data-template-id="${template.id}" class="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked>
                <label for="chk-${template.id}" class="ml-3 block text-md font-medium text-gray-700">${template.name}</label>
            `;
            templateListContainer.appendChild(div);
        });
    }

    // --- 이벤트 핸들러 ---
    async function onGenerateClick() {
        const petName = petNameInput.value.trim();
        if (!petName) {
            alert('환자 이름을 먼저 입력해주세요.');
            petNameInput.focus();
            return;
        }

        const selectedTemplateIds = Array.from(document.querySelectorAll('#template-list input[type="checkbox"]:checked'))
            .map(chk => chk.dataset.templateId);

        if (selectedTemplateIds.length === 0) {
            alert('저장할 안내문을 하나 이상 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        let generatedCount = 0;
        const totalCount = selectedTemplateIds.length;
        btnText.textContent = `이미지 생성 중... (${generatedCount}/${totalCount})`;

        try {
            const zip = new JSZip();
            
            for (const id of selectedTemplateIds) {
                const image = await generateImageFromTemplate(id, petName, dateInput.value, timeInput.value);
                if (image && image.blob) {
                    zip.file(image.filename, image.blob);
                }
                generatedCount++;
                btnText.textContent = `이미지 생성 중... (${generatedCount}/${totalCount})`;
            }

            btnText.textContent = 'ZIP 파일 압축 중...';

            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${petName}_보호자안내문.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('이미지 생성 중 오류 발생:', error);
            alert('이미지 생성에 실패했습니다. 개발자 콘솔(F12)을 확인해주세요.');
        } finally {
            generateBtn.disabled = false;
            btnText.textContent = '선택한 안내문 이미지로 일괄 저장';
        }
    }

    // --- 핵심 로직: 템플릿에서 이미지 생성 ---
    function generateImageFromTemplate(templateId, petName, date, time) {
        return new Promise((resolve, reject) => {
            const template = TEMPLATE_CONFIG[templateId];
            const iframe = document.createElement('iframe');
            // 스타일을 주어 화면 밖으로 완전히 숨김
            Object.assign(iframe.style, { position: 'absolute', left: '-9999px', width: '1024px', height: '1px', border: 'none' });
            iframe.src = template.file;

            iframe.onload = async () => {
                try {
                    const doc = iframe.contentDocument;
                    const win = iframe.contentWindow;

                    // iframe 내부에 값 주입
                    doc.getElementById('petName').value = petName;
                    const dateEl = doc.getElementById('attachDate');
                    const timeEl = doc.getElementById('attachTime');
                    if(dateEl) dateEl.value = date;
                    if(timeEl) timeEl.value = time;

                    // iframe 내부 함수 호출로 내용 업데이트
                    if (typeof win.updateTitle === 'function') win.updateTitle();
                    if (typeof win.calculateRemovalDate === 'function') win.calculateRemovalDate();

                    await new Promise(r => setTimeout(r, 200)); // 렌더링 대기

                    const captureArea = doc.getElementById('captureArea');
                    const canvas = await html2canvas(captureArea, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
                    
                    canvas.toBlob(blob => {
                        resolve({
                            filename: `${petName}_${template.imageName}.png`,
                            blob: blob
                        });
                        document.body.removeChild(iframe); // 중요: 처리 후 iframe 제거
                    }, 'image/png');

                } catch (err) {
                    document.body.removeChild(iframe);
                    reject(new Error(`'${template.name}' 템플릿 처리 중 오류: ${err.message}`));
                }
            };
            
            iframe.onerror = () => {
                document.body.removeChild(iframe);
                reject(new Error(`'${template.file}' 파일을 불러올 수 없습니다. 경로를 확인해주세요.`));
            };

            document.body.appendChild(iframe);
        });
    }

    // 대시보드 시작
    initialize();
});