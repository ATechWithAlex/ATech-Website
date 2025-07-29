// === Centralisation du chargement des produits ===
window.products = window.products || [];
window.productsLoaded = false;

/**
 * Charge la liste des produits si nécessaire.
 * @returns {Promise<Array>} Retourne une promesse avec la liste des produits.
 */
async function loadProducts() {
    // Retourne directement les produits si déjà chargés
    if (window.productsLoaded && Array.isArray(window.products)) {
        return window.products;
    }

    try {
        const response = await fetch('products.json');
        const data = await response.json();
        window.products = data;
        window.productsLoaded = true;
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
        return [];
    }
}