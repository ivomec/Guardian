// js/templates.js

const allTemplates = [
    {
        id: 'gabapentin',
        title: '가바펜틴 진정 약물 안내문',
        path: 'templates/가바펜틴 진정 약물 안내문.html', // 파일 경로 지정
        particle_type: '을/를' // '을/를' 타입
    },
    {
        id: 'norspan_patch',
        title: '노스판 패치 통증 관리 안내문',
        path: 'templates/노스판 패치 통증 관리 안내문.html', // 파일 경로 지정
        particle_type: '이/를' // '이를/를' 타입
    },
    // ▼▼▼▼▼ [수정] 2개의 새로운 안내문 정보 추가 ▼▼▼▼▼
    {
        id: 'dog_brushing',
        title: '강아지 양치 가이드',
        path: 'templates/강아지 양치.html', // 새 안내문 HTML 파일 경로
        particle_type: '을/를' // 환자 이름이 들어가지 않지만, 객체 구조 유지를 위해 추가
    },
    {
        id: 'cat_brushing',
        title: '고양이 양치 비법',
        path: 'templates/고양이 양치.html', // 새 안내문 HTML 파일 경로
        particle_type: '을/를' // 환자 이름이 들어가지 않지만, 객체 구조 유지를 위해 추가
    }
    // 여기에 새로운 안내문 정보를 계속 추가하면 됩니다.
];
