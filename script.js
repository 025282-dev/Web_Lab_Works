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

function initCatalog() {
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
    function syncUrl() {
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'all') {
            params.set('category', currentCategory);
        }
        if (searchquery.trim() !== '') {
            params.set('q', searchquery.trim());
        }
        const queryString = params.toString();
        const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }

    function renderState(message, { isError = false, onRetry = null } = {}) {
            catalogGrid.replaceChildren();

            const box = document.createElement('div');
            box.className = isError ? 'status-msg status-error' : 'status-msg';

            const text = document.createElement('p');
            text.textContent = message;
            box.appendChild(text);

            if (onRetry) {
                const retryButton = document.createElement('button');
                retryButton.type = 'button';
                retryButton.textContent = 'Спробувати ще раз';
                retryButton.addEventListener('click', onRetry);
                box.appendChild(retryButton);
            
            }

        catalogGrid.appendChild(box);
    }

    function renderServices(items = services) {
        if (items.length === 0) {
            renderState('Сервіси не знайдено', { isError: true, onRetry: () => fetchServices() });
            return;
        }

        const fragment = document.createDocumentFragment();
        
        items.forEach((service) => {
            const card = document.createElement('article');
            card.className = 'service-card';

            const title = document.createElement('h2');
            title.textContent = service.title;

            const desc = document.createElement('p');
            desc.textContent = service.description;

            const price = document.createElement('span');
            price.className = 'price';
            price.textContent = `Ціна: ${service.price}`;

            const detailsButton = document.createElement('button');
            detailsButton.type = 'button';
            detailsButton.className = 'details-button';
            detailsButton.dataset.id = String(service.id);
            detailsButton.textContent = 'Детальніше';
            card.append(title, desc, price, detailsButton);
            fragment.appendChild(card); 

        });

        catalogGrid.replaceChildren(fragment);
          }

    function applyFilters() {
        syncUrl();

        const query = searchquery.trim().toLowerCase();
        const filtered = services.filter((item) => {
            const matchesCategory =
                currentCategory === 'all' || item.category === currentCategory;
            const matchesText =
                query === '' ||
                item.title.toLowerCase().includes(query) ||
                (item.shortDesc || item.description || '').toLowerCase().includes(query);

            return matchesCategory && matchesText;
        });

        renderServices(filtered);
    }

    async function fetchServices() {
        if (fetchcontroller) { fetchcontroller.abort(); }

        fetchcontroller = new AbortController();
        isloading = true;
        renderState('Завантаження послуг...');

        try {
            const response = await fetch('services.json', { signal: fetchcontroller.signal });
            if (!response.ok) { 
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            services = Array.isArray(data) ? data : [];
            isloading = false;
            applyFilters();
        } catch (error) {
            if (error.name === 'AbortError') return;
            isloading = false;
            renderState('Не вдалося завантажити каталог. Перевірте підключення до мережі.', {
                isError: true,
                onRetry: fetchServices,
            });
        }
    }

    function openModal(service, triggerElement) {
        if (!modal) return;
        lastfocusedelement = triggerElement;
        modalTitle.textContent = service.title;
        modalDescription.textContent = service.description;
        modalPrice.textContent = `Ціна: ${service.price}`;
        modal.showModal();
    }

    if (catalogGrid) {
        catalogGrid.addEventListener('click', (event) => {
            const button = event.target.closest('.details-button');
            if (!button) return;
            const service = services.find((item) => String(item.id) === button.dataset.id);
            if (service) openModal(service, button);
        });
    }

    if (modal) {
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => modal.close());
        }
        modal.addEventListener('close', () => {
            if (lastfocusedelement) lastfocusedelement.focus();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchquery = searchInput.value;
            applyFilters();
        });
    }

    if (sidebarlist) {
        sidebarlist.addEventListener('click', (event) => {
            const link = event.target.closest('.filter-link');
            if (!link || !sidebarlist.contains(link)) return;
            event.preventDefault();
            currentCategory = link.dataset.category || 'all';
            sidebarlist.querySelectorAll('.filter-link').forEach((item) => {
                item.classList.toggle('active', item === link);
            });
            applyFilters();
        });
    }

    fetchServices();
