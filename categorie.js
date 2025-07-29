// === Récupération des paramètres d'URL ===
function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

const category = getQueryParam('cat');
const title = document.getElementById('category-title');
const container = document.getElementById('products-container');

// === Noms des catégories par langue ===
const categoryNames = {
    "smartphones": { fr: "Smartphones & Mobilité Numérique", en: "Smartphones & Digital Mobility" },
    "informatique": { fr: "Informatique & Hardware", en: "Computers & Hardware" },
    "iot": { fr: "Objets Connectés & Domotique", en: "IoT & Smart Home" },
    "audio-video": { fr: "Audio, Vidéo & Multimédia", en: "Audio, Video & Multimedia" },
    "gaming": { fr: "Gaming & Divertissement", en: "Gaming & Entertainment" },
    "vr-ar": { fr: "Réalité Immersive (VR, AR, MR)", en: "Immersive Reality (VR, AR, MR)" },
    "mobilite": { fr: "Mobilité Électrique & Transport", en: "Electric Mobility & Transport" },
    "logiciels": { fr: "Logiciels, Apps & Services", en: "Software, Apps & Services" },
    "innovations": { fr: "Futur & Innovations", en: "Future & Innovations" },
    "all": { fr: "Tous les Tests & Avis", en: "All Reviews & Tests" }
};

// === Mise à jour des balises SEO ===
function updateCategorySEO() {
    const lang = window.currentLang || 'fr';
    const catName = categoryNames[category]?.[lang] || (lang === 'en' ? "Category" : "Catégorie");

    const titleTemplate = window.translations[lang]?.seo_title_category || "{{category}} | ATech";
    const descTemplate = window.translations[lang]?.seo_description_category || "Découvrez tous nos tests et avis dans la catégorie {{category}}.";

    const replacePlaceholders = (tpl) => tpl.replace("{{category}}", catName);

    document.title = replacePlaceholders(titleTemplate);

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", replacePlaceholders(descTemplate));
}

// === Rendu des produits dans la catégorie ===
function renderCategory(products) {
    if (!products || !Array.isArray(products)) {
        container.innerHTML = `<p>${t('error_loading')}</p>`;
        return;
    }

    const lang = window.currentLang || 'fr';
    title.textContent = categoryNames[category]?.[lang] || (lang === 'en' ? "Category" : "Catégorie");

    const filtered = category === "all"
        ? products
        : products.filter(p => Array.isArray(p.category) ? p.category.includes(category) : p.category === category);

    if (!filtered.length) {
        container.innerHTML = `<p>${t('no_products')}</p>`;
        return;
    }

    container.innerHTML = filtered.map((p, index) => {
        const name = p.name?.[lang] || p.name;
        const summary = p.summary?.[lang] || p.summary;
        return `
            <div class="product-card fade-in" style="animation-delay: ${index * 0.1}s;">
                <img src="${p.image}" alt="${name}">
                <h3>${name}</h3>
                <p class="summary">${summary}</p>
                <a href="product.html?id=${p.id}" class="btn btn-primary">${t("btn_view")}</a>
            </div>
        `;
    }).join('');

    // Animation progressive
    requestAnimationFrame(() => {
        document.querySelectorAll('.fade-in').forEach(card => card.classList.add('visible'));
    });
}

// === Initialisation principale ===
function initCategorie() {
    if (!window.translations || !window.translations[window.currentLang]) return;

    updateCategorySEO();

    loadProducts()
        .then(renderCategory)
        .catch(() => container.innerHTML = `<p>${t('error_loading')}</p>`);
}

// === Écouteurs ===
document.addEventListener('DOMContentLoaded', () => {
    if (window.translations && Object.keys(window.translations).length) {
        initCategorie();
    } else {
        document.addEventListener('translationsLoaded', initCategorie, { once: true });
    }
});

document.addEventListener('languageChanged', initCategorie);