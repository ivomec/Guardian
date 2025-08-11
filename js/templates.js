// js/templates.js

// 받침 유무를 확인하는 헬퍼 함수
function hasFinalConsonant(name) {
    if (!name) return false;
    const lastChar = name.charCodeAt(name.length - 1);
    if (lastChar >= 0xAC00 && lastChar <= 0xD7A3) { // 한글 범위 체크
        return (lastChar - 0xAC00) % 28 !== 0;
    }
    return false;
}

// 모든 안내문 템플릿을 여기에 추가합니다.
const allTemplates = [
    {
        id: 'gabapentin', // 고유한 ID (영어로)
        title: '가바펜틴 진정 약물 안내문', // 대시보드에 표시될 이름
        generateHtml: (petName) => {
            const particle = hasFinalConsonant(petName) ? '을' : '를';
            const displayName = petName || '우리 아이';
            // 가바펜틴 안내문의 전체 HTML 코드가 여기에 들어갑니다.
            // (내용이 길어 생략, 실제로는 전체 코드가 필요합니다)
            return `
                <div style="font-family: 'Noto Sans KR', sans-serif; border: 1px solid #ccc; border-radius: 10px; padding: 20px; width: 780px; background: white;">
                    <h1 style="color: #3f2b96; text-align: center;">${displayName}${particle} 위한 편안한 진료 준비 안내서</h1>
                    <p style="text-align: center;">우리 아이의 스트레스를 줄여 더 안전하고 정확한 진료를 받기 위한 과정입니다.</p>
                    <hr>
                    <h2 style="color: #333;">💊 약을 먹고 나면 어떻게 보이나요?</h2>
                    <p>처방해 드린 약은 아이의 불안과 긴장을 완화시켜주는 효과가 있습니다. 약효가 나타나면 꾸벅꾸벅 졸거나, 몸을 살짝 비틀거릴 수 있으며, 이는 <strong style="color: #4f46e5;">정상적인 약효 반응</strong>이니 너무 걱정하지 마세요.</p>
                    <h2 style="color: #333;">🚨 안전을 위한 필수 수칙</h2>
                    <p><strong style="color: red;">안전한 공간에 격리하기:</strong> 약 복용 후에는 반드시 바닥이 안전한 방이나 넓은 케이지 안에 있도록 해주세요.</p>
                    <p><strong style="color: red;">투약 및 금식 시간 엄수:</strong> 안내받으신 투약 시간과 금식 시간을 반드시 지켜주세요.</p>
                    <footer style="text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
                        <p style="font-weight: bold;">금호동물병원 | 📞 062-383-7572</p>
                    </footer>
                </div>
            `;
        }
    },
    // 앞으로 여기에 새로운 안내문들을 계속 추가하시면 됩니다.
    // {
    //     id: 'norspan_patch',
    //     title: '노스판 패치 통증 관리 안내문',
    //     generateHtml: (petName) => { ... }
    // },
];