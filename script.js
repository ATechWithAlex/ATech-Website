// === Variables globales ===
const carousel = document.querySelector('.carousel');
const track = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let cardWidth = 240;

// === Affichage des produits dans le carousel ===
function renderProducts(products) {
    if (!Array.isArray(products) || !products.length || !track) return;

    const lang = window.currentLang || 'fr';
    track.innerHTML = products.map(p => {
        const name = typeof p.name === 'object' ? p.name[lang] || p.name['fr'] : p.name;
        return `
            <div class="card" data-id="${p.id}" data-category="${p.category}">
                <img src="${p.image}" alt="${name}">
                <h3>${name}</h3>
                <p>${'★'.repeat(Math.floor(p.rating))}${p.rating % 1 ? '½' : ''}</p>
            </div>
        `;
    }).join('');

    const firstCard = track.querySelector('.card');
    if (firstCard) cardWidth = firstCard.offsetWidth + 20;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            window.location.href = `product.html?id=${card.dataset.id}`;
        });
    });
}

// === Initialisation du carousel ===
function initCarousel() {
    if (!track) return; // On sort si la page n'a pas de carousel
    loadProducts()
        .then(renderProducts)
        .catch(err => console.error('Erreur chargement produits :', err));

    // Navigation carousel
    nextBtn?.addEventListener('click', () => carousel?.scrollBy({ left: cardWidth, behavior: 'smooth' }));
    prevBtn?.addEventListener('click', () => carousel?.scrollBy({ left: -cardWidth, behavior: 'smooth' }));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') carousel?.scrollBy({ left: cardWidth, behavior: 'smooth' });
        if (e.key === 'ArrowLeft') carousel?.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
}

// === Boutons catégories ===
function initCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = `categorie.html?cat=${btn.dataset.category}`;
        });
    });
}

// === Mise à jour des boutons de catégories ===
function updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        const catKey = `cat_${btn.dataset.category}`;
        if (window.translations?.[window.currentLang]?.[catKey]) {
            btn.innerText = t(catKey);
        }
    });
}

// === Menu burger ===
function initBurgerMenu() {
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('nav-menu');

    burger?.addEventListener('click', () => navMenu?.classList.toggle('show'));
    navMenu?.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => navMenu.classList.remove('show'))
    );
}

// === Événements globaux ===
document.addEventListener('DOMContentLoaded', () => {
    updateCategoryButtons();
    initCategoryButtons();
    initBurgerMenu();
    initCarousel(); // Appel seulement si carousel existe
});

document.addEventListener('languageChanged', () => {
    updateCategoryButtons();
    if (track) renderProducts(window.products);
});