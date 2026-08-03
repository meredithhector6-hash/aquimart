document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

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

    overlay.addEventListener('click', closeMenu);

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===== RECHERCHE + À LA UNE + STATS =====
  // Ces trois blocs partagent le même fichier articles-index.json,
  // donc on ne le charge qu'une seule fois.
  let articlesIndex = [];

  fetch('articles-index.json')
    .then(res => res.json())
    .then(data => {
      articlesIndex = data;
      renderFeatured();
      renderStats();
    })
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

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove('visible');
      }
    });
  }

  setupSearch('search-input', 'search-results');
  setupSearch('search-input-mobile', 'search-results-mobile');

  // Article "à la une" = toujours le DERNIER élément d'articles-index.json.
  // Pour changer l'article mis en avant, il suffit d'ajouter le nouveau
  // à la fin du tableau dans articles-index.json.
  function renderFeatured() {
    const container = document.getElementById('a-la-une-container');
    if (!container || articlesIndex.length === 0) return;

    const article = articlesIndex[articlesIndex.length - 1];
    container.innerHTML = `
      <span class="a-la-une-tag">À la une</span>
      <span class="article-categorie-inline">${article.categorie}</span>
      <h2><a href="${article.url}">${article.title}</a></h2>
      <p>${article.excerpt || ''}</p>
      <a class="a-la-une-cta" href="${article.url}">Lire l'article →</a>
    `;
  }

  // Repère "X articles" sur la page d'accueil (le nombre de catégories et
  // de réflexions Motscoeur restent à mettre à jour à la main pour l'instant).
  function renderStats() {
    const el = document.getElementById('stats-articles');
    if (!el) return;
    el.textContent = articlesIndex.length;
  }

  // ===== FAVORIS =====
  const FAVORIS_KEY = 'aquimart_favoris';

  function getFavoris() {
    try {
      return JSON.parse(localStorage.getItem(FAVORIS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function setFavoris(list) {
    localStorage.setItem(FAVORIS_KEY, JSON.stringify(list));
  }

  function isFavori(url, favoris) {
    return favoris.some(f => f.url === url);
  }

  function initFavoriButtons() {
    const favoris = getFavoris();
    const favorisContainer = document.getElementById('favoris-container');

    document.querySelectorAll('.favori-btn').forEach(btn => {
      const url = btn.dataset.url;
      if (isFavori(url, favoris)) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let current = getFavoris();

        if (isFavori(url, current)) {
          current = current.filter(f => f.url !== url);
        } else {
          current.push({
            url: url,
            title: btn.dataset.title,
            categorie: btn.dataset.categorie
          });
        }
        setFavoris(current);

        if (favorisContainer) {
          renderFavoris();
        } else {
          btn.classList.toggle('active');
          btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        }
      });
    });
  }

  function renderFavoris() {
    const container = document.getElementById('favoris-container');
    if (!container) return;

    const favoris = getFavoris();

    if (favoris.length === 0) {
      container.innerHTML = `
        <div class="un-un">
          <p>Tu n'as pas encore de favoris. Explore nos articles et clique sur le cœur pour les garder sous la main.</p>
        </div>`;
      return;
    }

    container.innerHTML = favoris.map(f => `
      <div class="un-un">
        <button class="favori-btn active" data-url="${f.url}" data-title="${f.title}" data-categorie="${f.categorie}" aria-label="Retirer des favoris" aria-pressed="true">
          <svg viewBox="0 0 24 24"><path d="M12 21s-6.716-4.35-9.5-8.5C.5 9 1.8 5 5.5 5c2 0 3.5 1.2 4.5 2.8C11 6.2 12.5 5 14.5 5 18.2 5 19.5 9 17.5 12.5 14.716 16.65 12 21 12 21z"/></svg>
        </button>
        <h2>${f.categorie}</h2>
        <a href="${f.url}">${f.title}</a>
      </div>
    `).join('');

    initFavoriButtons();
  }

  renderFavoris();
  initFavoriButtons();

  // ===== ACCORDÉON CATÉGORIES =====
  function initAccordeon() {
    const items = document.querySelectorAll('.accordeon-item');
    if (items.length === 0) return;

    items.forEach(item => {
      const header = item.querySelector('.accordeon-header');
      header.addEventListener('click', () => {
        item.classList.toggle('open');
      });
    });

    if (location.hash) {
      const target = document.querySelector(location.hash);
      if (target && target.classList.contains('accordeon-item')) {
        target.classList.add('open');
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }

  initAccordeon();

  // ===== FILTRE COURT / LONG =====
  function initFiltreLongueur() {
    const buttons = document.querySelectorAll('.filtre-longueur button');
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filtre = btn.dataset.filtre;

        document.querySelectorAll('.accordeon-panel').forEach(panel => {
          const cards = panel.querySelectorAll('.un-un');
          let visibleCount = 0;

          cards.forEach(card => {
            const match = filtre === 'tous' || card.dataset.longueur === filtre;
            card.style.display = match ? '' : 'none';
            if (match) visibleCount++;
          });

          let emptyMsg = panel.querySelector('.accordeon-vide');
          const unContainer = panel.querySelector('.un');

          if (visibleCount === 0) {
            if (!emptyMsg && unContainer) {
              emptyMsg = document.createElement('p');
              emptyMsg.className = 'accordeon-vide';
              emptyMsg.textContent = "Aucun article dans cette catégorie pour l'instant.";
              unContainer.appendChild(emptyMsg);
            }
          } else if (emptyMsg) {
            emptyMsg.remove();
          }
        });
      });
    });
  }

  initFiltreLongueur();
});
