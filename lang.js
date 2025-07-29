// === Variables globales ===
window.translations = {};
window.currentLang = localStorage.getItem('lang') || 'fr';

// === Fonction utilitaire de traduction ===
window.t = function (key) {
    const lang = window.currentLang || 'fr';
    return window.translations[lang]?.[key] || key;
};

// === Chargement des traductions ===
async function loadTranslations() {
    try {
        const res = await fetch('translations.json');
        window.translations = await res.json();
        applyTranslations(window.currentLang);
        // Signale que les traductions sont prêtes
        document.dispatchEvent(new Event('translationsLoaded'));
    } catch (error) {
        console.error('Erreur de chargement des traductions :', error);
    }
}

// === Application des traductions ===
function applyTranslations(lang) {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        const text = window.translations[lang]?.[key];
        if (!text) return;

        if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
            el.placeholder = text;
        } else if (el.id === 'page-title') {
            document.title = text;
        } else {
            el.innerText = text;
        }
    });
    document.documentElement.lang = lang;
}

// === Menu de langue ===
function initLangMenu() {
    const langSwitcher = document.getElementById('lang-switcher');
    if (!langSwitcher) return;

    const langButton = langSwitcher.querySelector('.lang-btn');
    const flags = langSwitcher.querySelectorAll('.lang-menu img.flag');

    langButton.addEventListener('click', e => {
        e.stopPropagation();
        langSwitcher.classList.toggle('open');
    });

    flags.forEach(flag => flag.addEventListener('click', e => {
        const lang = e.target.dataset.lang;
        if (!lang || lang === window.currentLang) return;

        // Mise à jour de la langue
        window.currentLang = lang;
        localStorage.setItem('lang', lang);
        applyTranslations(lang);

        // Met à jour le drapeau actif
        const activeFlag = langButton.querySelector('img');
        activeFlag.src = e.target.src;
        activeFlag.alt = e.target.alt;

        flags.forEach(img => img.classList.remove('active'));
        e.target.classList.add('active');
        langSwitcher.classList.remove('open');

        // Déclenche l'événement global
        document.dispatchEvent(new Event('languageChanged'));
    }));

    // Initialisation du drapeau actif
    const activeFlag = langSwitcher.querySelector(`img.flag[data-lang="${window.currentLang}"]`);
    if (activeFlag) {
        langButton.querySelector('img').src = activeFlag.src;
        langButton.querySelector('img').alt = activeFlag.alt;
        activeFlag.classList.add('active');
    }

    // Ferme le menu au clic à l'extérieur
    document.addEventListener('click', e => {
        if (!langSwitcher.contains(e.target)) langSwitcher.classList.remove('open');
    });
}

// === Réaction au changement de langue ===
document.addEventListener('languageChanged', () => {
    // Mise à jour des boutons de catégories
    if (typeof updateCategoryButtons === 'function') updateCategoryButtons();

    // Mise à jour des produits du carousel (si présent)
    const track = document.querySelector('.carousel-track');
    if (typeof renderProducts === 'function' && track) {
        renderProducts(window.products);
    }

    // Mise à jour de la page catégorie si elle est ouverte
    if (typeof initCategorie === 'function') {
        initCategorie();
    }
});

// === Initialisation ===
document.addEventListener('DOMContentLoaded', () => {
    initLangMenu();
    loadTranslations();
});

// === Mise à jour SEO dynamique ===
function updateSEOPage(type, data = {}) {
    const lang = window.currentLang || 'fr';

    const titleTemplate = window.translations[lang]?.[`seo_title_${type}`] || document.title;
    const descTemplate = window.translations[lang]?.[`seo_description_${type}`] || '';
    const keywordsTemplate = window.translations[lang]?.[`seo_keywords_${type}`] || '';

    const replacePlaceholders = (template) => {
        return template.replace(/\{\{(.*?)\}\}/g, (match, key) => data[key.trim()] || '');
    };

    const title = replacePlaceholders(titleTemplate);
    const description = replacePlaceholders(descTemplate);
    const keywords = replacePlaceholders(keywordsTemplate);

    document.title = title;

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = "description";
        document.head.appendChild(descMeta);
    }
    descMeta.content = description;

    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.name = "keywords";
        document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.content = keywords;
}