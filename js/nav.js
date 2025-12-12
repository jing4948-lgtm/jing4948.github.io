document.addEventListener("DOMContentLoaded", function() {
    // 🌟🌟🌟 네비게이션 최종 안정화: 현재 경로를 분석하여 rootPath를 결정 🌟🌟🌟
    
    const path = window.location.pathname;
    let rootPath = './'; // 기본값 (최상위 index.html일 경우)

    // '페이지/' 폴더 아래에 있는지 확인하여 경로 깊이를 결정
    // 예: /페이지/조편성/index.html -> depth는 2 (조편성까지) -> ../../ 필요
    if (path.includes('/페이지/')) {
        // 경로를 '/'로 나누고, 파일명과 빈 문자열을 제외한 배열의 길이를 계산
        const parts = path.split('/').filter(p => p.length > 0 && p !== 'index.html');
        // depth는 '페이지' 폴더를 제외한 하위 폴더 개수입니다.
        // 현재 구조상 '페이지' 폴더 아래에 '조편성' 또는 '학습지'가 있으므로 depth는 2가 나옵니다.
        const depth = parts.length; 
        
        rootPath = '';
        for (let i = 0; i < depth; i++) {
            rootPath += '../';
        }
    }

    const navHTML = `
        <nav>
            <a href="${rootPath}index.html" class="logo">My Ocean View</a>
            <ul>
                <li><a href="${rootPath}index.html">홈</a></li>
                <li><a href="${rootPath}페이지/조편성/index.html">조편성</a></li>
                <li><a href="${rootPath}페이지/학습지/index.html">학습지</a></li>
            </ul>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
});
