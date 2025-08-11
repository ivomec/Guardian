// js/templates.js

const allTemplates = [
    {
        id: 'gabapentin',
        title: '가바펜틴 진정 약물 안내문',
        path: 'templates/가바펜틴 진정 약물 안내문.html',
        particle_type: '을/를'
    },
    {
        id: 'norspan_patch',
        title: '노스판 패치 통증 관리 안내문',
        path: 'templates/노스판 패치 통증 관리 안내문.html',
        particle_type: '이/를'
    },
    // ✨ [신규 추가] 강아지 양치 안내문
    {
        id: 'dog_brushing_guide',
        title: '강아지 양치 가이드',
        path: 'templates/강아지 양치.html'
        // 환자 이름이 들어가지 않으므로 particle_type은 생략합니다.
    },
    // ✨ [신규 추가] 고양이 양치 안내문
    {
        id: 'cat_brushing_guide',
        title: '고양이 양치 가이드',
        path: 'templates/고양이 양치.html'
        // 환자 이름이 들어가지 않으므로 particle_type은 생략합니다.
    }
];
