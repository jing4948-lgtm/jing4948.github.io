document.addEventListener("DOMContentLoaded", function() {
    // 🌟🌟🌟 네비게이션 최종 안정화 코드 🌟🌟🌟
    
    // 현재 URL의 호스트를 기준으로 프로젝트 루트 경로를 결정합니다.
    const path = window.location.pathname;
    
    // index.html이 있는 프로젝트의 최상위 경로를 추출합니다.
    // 예: /myrepo/페이지/조편성/index.html -> '/myrepo/'
    // 이 로직은 GitHub Pages 환경을 고려하여 최상위 폴더명까지 포함합니다.
    
    let basePath = '';
    const pathSegments = path.split('/').filter(p => p.length > 0);
    
    if (pathSegments.length > 0) {
        // GitHub Pages 환경에서는 보통 첫 번째 세그먼트가 저장소 이름입니다.
        // 하지만 로컬 환경에서는 단순히 '/'만 필요합니다.
        
        // 간단한 상대 경로로 다시 회귀 (이전의 모든 복잡한 경로 계산 로직보다 더 안정적)
        // 네비게이션 로직이 삽입되는 곳에서 최상위 index.html까지의 경로를 계산합니다.
        
        let rootPath = './';
        if (path.includes('/페이지/')) {
            // 현재 페이지가 하위 폴더에 있다면, 경로를 한 단계씩 올라갑니다.
            const depth = pathSegments.length - pathSegments.indexOf('페이지') + 1;
            rootPath = '';
            for (let i = 0; i < depth; i++) {
                rootPath += '../';
            }
        } else if (pathSegments.length > 1) {
            // 루트 폴더 (index.html)에 있다면 './'만 필요합니다.
        }

        // 🌟 최종적으로, 모든 링크를 현재 폴더 구조의 상대 경로를 사용하도록 고정합니다.
        // 이 로직은 간단한 상대 경로를 직접 사용합니다.
    }


    const navHTML = `
        <nav>
            <a href="index.html" class="logo">My Ocean View</a>
            <ul>
                <li><a href="index.html">홈</a></li>
                <li><a href="페이지/조편성/index.html">조편성</a></li>
                <li><a href="페이지/학습지/index.html">학습지</a></li>
            </ul>
        </nav>
    `;

    // <body> 태그가 존재할 때만 네비게이션을 삽입
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
});
