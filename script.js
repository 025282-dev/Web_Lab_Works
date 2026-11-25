function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

function getInitTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }   
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    }
}

applyTheme(getInitTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}
}

function initcatalog() {
    const catalogGrid = document.querySelector('.catalog-grid');
    if (!catalogGrid) return;

    const sidebarlist = document.querySelector('.sidebar');
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('service-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalPrice = document.getElementById('modal-price');
    const closeModalButton = document.getElementById('close-modal');

    const urlParams = new URLSearchParams(window.location.search);
    let services = []
    let currentCategory = urlParams.get('category') || 'all';
    let searchquery = urlParams.get('q') || '';
    let isloading = false;
    let lastfocusedelement = null;
    let fetchcontroller = null;

    if (searchInput) {
        searchInput.value = searchquery;
    }
    if (sidebarlist) { 
        const filterLinks = sidebarlist.querySelectorAll('.filter-link');
        const hasMatch = Array.from(filterLinks).some(link => link.dataset.category === currentCategory);
        if (!hasMatch) {
            currentCategory = 'all';
        }
    filterLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.category === currentCategory);
        });
    }
initTheme();