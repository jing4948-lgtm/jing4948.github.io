document.addEventListener("DOMContentLoaded", function() {
    // 🌟🌟🌟 최종 수정: 현재 URL의 깊이를 정확히 계산하여 rootPath 설정 🌟🌟🌟

    const path = window.location.pathname;
    
    // 1. 현재 경로의 깊이 계산
    // 예: /index.html -> 1
    // 예: /페이지/조편성/index.html -> 3
    // 'http://.../index.html'에서 파일 이름 부분만 제거하고 '/'로 분리하여 폴더 깊이를 계산
    const parts = path.split('/').filter(p => p.length > 0 && p !== 'index.html');
    const depth = parts.length; 

    let rootPath = ''; // 기본값 (최상위 index.html에 있을 경우)

    // 2. 깊이에 따라 rootPath 설정 (../ 반복)
    // depth가 0 (최상위)이 아니면, 각 레벨마다 '../'가 필요합니다.
    if (depth > 0) {
        // '../' * depth 만큼 반복하여 경로를 만듭니다.
        // 예: depth=1 ('페이지') -> '../'
        // 예: depth=2 ('페이지/조편성') -> '../../'
        for (let i = 0; i < depth; i++) {
            rootPath += '../';
        }
    } else {
        rootPath = './';
    }
    
    // GitHub Pages 특성상 index.html이 포함되지 않을 수 있으므로, depth=1일 때도 ../로 처리
    // 단, 우리가 사용하는 구조는 /페이지/폴더/index.html 이므로 depth=2(페이지/폴더)에서 '../../'이 필요합니다.
    // 위의 로직으로 /페이지/조편성/index.html의 depth는 2가 되며, rootPath는 '../../'이 됩니다.
    // /index.html의 depth는 0이 되며, rootPath는 './'가 됩니다. (가장 안정적)


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

    // body 태그의 가장 첫 번째 자식으로 네비게이션 추가
    document.body.insertAdjacentHTML('afterbegin', navHTML);
});
