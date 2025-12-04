document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.createElement('div');
    navContainer.id = 'nav-container';
    
    // Determine current path to set active state and correct links
    const path = window.location.pathname;
    const isHome = path.endsWith('index.html') || path.endsWith('/');
    
    // Base path adjustment
    // If we are in 'pages/', we need to go up one level for index.html, and stay same for other pages
    // If we are in root, index.html is './', pages are 'pages/'
    
    const rootPrefix = isHome ? './' : '../';
    const pagesPrefix = isHome ? 'pages/' : './';
    
    navContainer.innerHTML = `
        <nav>
            <a href="${rootPrefix}index.html" class="nav-link ${isHome ? 'active' : ''}">🏠 홈</a>
            <a href="${pagesPrefix}deeplearning.html" class="nav-link ${path.includes('deeplearning') ? 'active' : ''}">🤖 딥러닝 게임</a>
            <a href="${pagesPrefix}seatingarrangement.html" class="nav-link ${path.includes('seatingarrangement') ? 'active' : ''}">🏫 자리 배치</a>
        </nav>
    `;
    
    document.body.prepend(navContainer);
});
