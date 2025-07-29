function getQueryParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}
const productId = getQueryParam('id');

function initProduct() {
    const container = document.getElementById('product-container');
    if (!container) return;

    const renderProduct = (product) => {
        if (!product) {
            container.innerHTML = `<p>${t('product_not_found')}</p>`;
            return;
        }

        const lang = window.currentLang || 'fr';
        const name = product.name?.[lang] || product.name;
        const summary = product.summary?.[lang] || product.summary;

        // --- SEO dynamique via translations.json ---
        const seoTitleTpl = window.translations[lang]?.seo_title_product || "{{product}} | ATech - Tests & Avis";
        const seoDescTpl = window.translations[lang]?.seo_description_product || "Découvrez notre avis complet sur {{product}} : {{summary}}.";

        const replacePlaceholders = (tpl) => tpl
            .replace("{{product}}", name)
            .replace("{{summary}}", summary || '');

        document.title = replacePlaceholders(seoTitleTpl);

        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', replacePlaceholders(seoDescTpl));
        // --- FIN SEO ---

        const pros = product.pros?.[lang] || product.pros || [];
        const cons = product.cons?.[lang] || product.cons || [];
        const tests = product.tests?.[lang] || product.tests || [];
        const verdict = product.verdict?.[lang] || product.verdict || '';
        const experience = product.experience?.[lang] || product.experience || '';
        const criteria = product.criteriaRatings?.[lang] || product.criteriaRatings?.['fr'] || {};

        const durability = product.durability?.[lang] || product.durability || {};
        const accessories = product.accessories?.[lang] || product.accessories || {};
        const valueForMoney = product.valueForMoney?.[lang] || product.valueForMoney || '';
        const warranty = product.warranty?.[lang] || product.warranty || {};
        const targetUsers = product.targetUsers?.[lang] || product.targetUsers || [];


        const criteriaHTML = Object.entries(criteria).map(([crit, note]) => `
            <div class="criteria-item">
                <span class="criteria-label">${crit}</span>
                <div class="criteria-bar"><div class="criteria-fill" style="width: ${(note / 5) * 100}%;"></div></div>
                <span class="criteria-value">${note}/5</span>
            </div>
        `).join('');

        const listHTML = (arr) => (Array.isArray(arr) ? arr.map(i => `<li>${i}</li>`).join('') : '');

        const tableHTML = (obj) => Object.entries(obj).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');

        container.innerHTML = `
            <section id="product" class="product-hero">
                <div class="hero-content">
                    <div class="hero-img"><img src="${product.image}" alt="${name}"></div>
                    <div class="hero-text">
                        <h1>${name}</h1>
                        <p class="price">${product.price || ''}</p>
                        <p class="rating">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 ? '½' : ''}</p>
                        <p class="summary">${summary}</p>
                        <a href="${product.affiliateLink}" target="_blank" class="btn btn-primary">${t('btn_buy')}</a>
                    </div>
                </div>
            </section>
            <section class="gallery-section">
                <h2>${t('gallery_title')}</h2>
                <div class="gallery">${(product.gallery || []).map(img => `<img src="${img}" alt="${name}">`).join('')}</div>
            </section>
            <div class="lightbox" id="lightbox">
                <span class="lightbox-close" id="lightbox-close">&times;</span>
                <img class="lightbox-img" id="lightbox-img" src="" alt="">
                <div class="lightbox-nav">
                    <span class="lightbox-prev" id="lightbox-prev">&#10094;</span>
                    <span class="lightbox-next" id="lightbox-next">&#10095;</span>
                </div>
            </div>
            <section id="product-specs" class="product-specs">
                <h2>${t('specs_title')}</h2>
                <table class="specs-table">
                    ${Object.entries(product.specs?.[lang] || product.specs || {}).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
                </table>
            </section>
            <section class="test-details">
                <h2>${t('tests_practical')}</h2>
                <ul class="test-list">${listHTML(tests)}</ul>
            </section>
            
           
            <section id="ratings" class="criteria-ratings">
                <h3>${t('criteria_title')}</h3>
                <div class="criteria-content">
                    <div class="criteria-bars">
                        ${criteriaHTML}
                    </div>
                    <div class="criteria-chart">
                        <canvas id="criteriaRadarCustom" width="350" height="350"></canvas>
                    </div>
                </div>
            </section>
            
            
            <section class="pros-cons">
                <div class="pros"><h3>${t('pros_title')}</h3><ul>${listHTML(pros)}</ul></div>
                <div class="cons"><h3>${t('cons_title')}</h3><ul>${listHTML(cons)}</ul></div>
            </section>
            ${experience ? `
            <section id="experience" class="experience-section">
                <h2>${t('experience_title')} ${name}</h2>
                <div class="experience-content" id="experience-content">${experience}</div>
                <button class="btn-toggle" onclick="toggleExperience()">${t('experience_read_more')}</button>
            </section>` : ''}
            
            <!-- Nouvelle section : Qualité de fabrication & durabilité -->
            ${Object.keys(durability).length ? `
            <section class="durability-section">
                <h2>${t('durability_title')}</h2>
                <table class="specs-table">
                    ${tableHTML(durability)}
                </table>
            </section>` : ''}

            <!-- Nouvelle section : Accessoires & écosystème -->
            ${Object.keys(accessories).length ? `
            <section class="accessories-section">
                <h2>${t('accessories_title')}</h2>
                <table class="specs-table">
                    ${tableHTML(accessories)}
                </table>
            </section>` : ''}

            <!-- Nouvelle section : Rapport qualité/prix -->
            ${valueForMoney ? `
            <section class="value-section">
                <h2>${t('value_title')}</h2>
                <p>${valueForMoney}</p>
            </section>` : ''}

            <!-- Nouvelle section : Longévité & SAV -->
            ${Object.keys(warranty).length ? `
            <section class="warranty-section">
                <h2>${t('warranty_title')}</h2>
                <table class="specs-table">
                    ${tableHTML(warranty)}
                </table>
            </section>` : ''}

            <!-- Nouvelle section : Verdict "pour qui ?" -->
            ${targetUsers.length ? `
            <section class="target-section">
                <h2>${t('target_title')}</h2>
                <ul class="test-list">${listHTML(targetUsers)}</ul>
            </section>` : ''}

            
            
            
            <section class="competitors-section">
                <h2>${t('competitors_title')}</h2>
                <ul class="competitors-list">${listHTML(product.competitors)}</ul>
            </section>
            <section id="verdict" class="verdict">
                <p class="final-rating">${t('final_rating')} : ${product.finalRating}</p>
                <p class="recommendation">${verdict}</p>
            </section>
            <section class="contact-feedback">
                <h2>${t('your_opinion')}</h2>
                <p>${t('community_message')}</p>
            </section>
        `;
        initLightbox();

        drawCustomRadar(criteria);

    };

    loadProducts()
        .then(products => renderProduct(products.find(p => p.id === productId)))
        .catch(() => container.innerHTML = `<p>${t('error_loading')}</p>`);
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    const lightboxImg = document.getElementById('lightbox-img');
    const images = [...document.querySelectorAll('.gallery img')];
    let current = 0;

    const open = (i) => {
        current = i;
        lightbox.style.display = 'flex';
        lightboxImg.src = images[i].src;
    };
    const close = () => lightbox.style.display = 'none';
    const prev = () => open((current - 1 + images.length) % images.length);
    const next = () => open((current + 1) % images.length);

    images.forEach((img, i) => img.addEventListener('click', () => open(i)));
    document.getElementById('lightbox-close')?.addEventListener('click', close);
    document.getElementById('lightbox-prev')?.addEventListener('click', prev);
    document.getElementById('lightbox-next')?.addEventListener('click', next);
    
    // --- Fermer le lightbox en cliquant à l'extérieur de l'image ---
    /*
    lightbox.addEventListener('click', (e) => {
        // On vérifie que le clic n'est PAS sur l'image ou les flèches
        if (!e.target.closest('.lightbox-img') &&
            !e.target.closest('.lightbox-prev') &&
            !e.target.closest('.lightbox-next')) {
            close();
        }
    });
     */
}

function toggleExperience() {
    const content = document.getElementById('experience-content');
    const btn = document.querySelector('.btn-toggle');
    if (!content || !btn) return;

    const expanded = content.classList.toggle('expanded');
    content.style.maxHeight = expanded ? content.scrollHeight + 'px' : '100px';
    btn.innerText = t(expanded ? 'experience_read_less' : 'experience_read_more');

    if (!expanded) {
        const sectionTitle = document.querySelector('.experience-section h2');
        if (sectionTitle) sectionTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.addEventListener('translationsLoaded', initProduct);
document.addEventListener('languageChanged', initProduct);


function drawCustomRadar(criteria) {
    const canvas = document.getElementById('criteriaRadarCustom');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const labels = Object.keys(criteria);
    const data = Object.values(criteria);
    const maxValue = 5;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const radius = 120;
    const stepAngle = (2 * Math.PI) / labels.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // === DESSINER LES CERCLES/TOILES D'ARAIGNÉE ===
    const levels = 5; // Nombre de niveaux
    for (let level = 1; level <= levels; level++) {
        const r = (radius / levels) * level;
        ctx.beginPath();
        for (let i = 0; i < labels.length; i++) {
            const angle = i * stepAngle - Math.PI / 2;
            const x = center.x + Math.cos(angle) * r;
            const y = center.y + Math.sin(angle) * r;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.stroke();
    }

    // === AXES ET LABELS ===
    labels.forEach((label, i) => {
        const angle = i * stepAngle - Math.PI / 2;
        const x = center.x + Math.cos(angle) * (radius + 35); // +35 au lieu de +20
        const y = center.y + Math.sin(angle) * (radius + 35); // +35 au lieu de +20

        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.fillText(label, x, y);
    });

    // === POLYGONE DES VALEURS + POINTS ===
    const points = []; // <-- AJOUTÉ pour stocker les sommets
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
        const angle = i * stepAngle - Math.PI / 2;
        const val = (data[i] / maxValue) * radius;
        const x = center.x + Math.cos(angle) * val;
        const y = center.y + Math.sin(angle) * val;
        points.push({ x, y }); // <-- STOCKER LES COORDONNÉES
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(0, 224, 255, 0.4)";
    ctx.strokeStyle = "#00e0ff";
    ctx.fill();
    ctx.stroke();

    // === TRACER LES POINTS AUX SOMMETS ===
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#00e0ff";
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2); // Rayon = 4px
        ctx.fill();
        ctx.stroke();
    });
}
