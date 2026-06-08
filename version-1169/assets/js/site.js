(() => {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.classList.add('is-missing-image');
        });
    });

    document.querySelectorAll('[data-hero]').forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const next = hero.querySelector('[data-hero-next]');
        const prev = hero.querySelector('[data-hero-prev]');
        let current = 0;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        next?.addEventListener('click', () => show(current + 1));
        prev?.addEventListener('click', () => show(current - 1));
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => show(index));
        });
        window.setInterval(() => show(current + 1), 6500);
    });

    document.querySelectorAll('.filter-section').forEach((section) => {
        const input = section.querySelector('[data-filter-search]');
        const buttons = Array.from(section.querySelectorAll('[data-filter]'));
        const cards = Array.from(section.querySelectorAll('.movie-card'));
        let activeFilter = 'all';

        const apply = () => {
            const query = (input?.value || '').trim().toLowerCase();
            cards.forEach((card) => {
                const searchText = (card.dataset.search || '').toLowerCase();
                const matchesQuery = !query || searchText.includes(query);
                let matchesFilter = true;

                if (activeFilter !== 'all') {
                    const [key, value] = activeFilter.split(':');
                    matchesFilter = (card.dataset[key] || '') === value;
                }

                card.classList.toggle('is-filter-hidden', !(matchesQuery && matchesFilter));
            });
        };

        input?.addEventListener('input', apply);
        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                activeFilter = button.dataset.filter || 'all';
                buttons.forEach((item) => item.classList.toggle('active', item === button));
                apply();
            });
        });
    });

    document.querySelectorAll('[data-live-search]').forEach((input) => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && input.value.trim()) {
                const target = new URL('search.html', window.location.href);
                target.searchParams.set('q', input.value.trim());
                window.location.href = target.toString();
            }
        });
    });

    const searchParams = new URLSearchParams(window.location.search);
    const query = searchParams.get('q');

    if (query) {
        document.querySelectorAll('[data-filter-search]').forEach((input) => {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }
})();
