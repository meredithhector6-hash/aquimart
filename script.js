document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // Créer l'overlay dynamiquement
  const overlay = document.createElement('div');
  overlay.classList.add('nav-overlay');
  document.body.appendChild(overlay);

  function openMenu() {
    navMenu.classList.add('open');
    hamburger.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener('click', closeMenu);

    // Fermer en cliquant sur un lien
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===== RECHERCHE =====
  // Chemin relatif : fonctionne tant que articles-index.json est à la racine du site,
  // au même niveau que les pages HTML.
  let articlesIndex = [];

  fetch('articles-index.json')
    .then(res => res.json())
    .then(data => { articlesIndex = data; })
    .catch(err => console.error('Impossible de charger l\'index des articles :', err));

  function renderResults(container, matches) {
    container.innerHTML = '';
    if (matches.length === 0) {
      container.innerHTML = '<p class="no-results">Aucun article trouvé.</p>';
      container.classList.add('visible');
      return;
    }
    matches.forEach(article => {
      const link = document.createElement('a');
      link.href = article.url;
      link.innerHTML = `<span class="result-categorie">${article.categorie}</span>${article.title}`;
      container.appendChild(link);
    });
    container.classList.add('visible');
  }

  function setupSearch(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      if (query.length === 0) {
        results.classList.remove('visible');
        results.innerHTML = '';
        return;
      }
      const matches = articlesIndex.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.categorie.toLowerCase().includes(query)
      );
      renderResults(results, matches);
    });

    // Fermer les résultats en cliquant ailleurs
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove('visible');
      }
    });
  }

  setupSearch('search-input', 'search-results');
  setupSearch('search-input-mobile', 'search-results-mobile');
});
