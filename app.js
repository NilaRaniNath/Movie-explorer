/**
 * ShowPulse - TV Shows Explorer Application JavaScript
 * Dynamic DOM UI Logic & State Management
 * Powered by TVMaze API (api.js)
 */

(function () {
  'use strict';

  // Fallback SVG Images
  const PLACEHOLDER_POSTER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" fill="%230f172a"><rect width="300" height="420" fill="%230f172a"/><rect x="1" y="1" width="298" height="418" fill="none" stroke="%23334155" stroke-width="2"/><g transform="translate(110, 150)" fill="%23475569"><path d="M40 0 C17.9 0 0 17.9 0 40 C0 62.1 17.9 80 40 80 C62.1 80 80 62.1 80 40 C80 17.9 62.1 0 40 0 Z M40 70 C23.4 70 10 56.6 10 40 C10 23.4 23.4 10 40 10 C56.6 10 70 23.4 70 40 C70 56.6 56.6 70 40 70 Z"/><polygon points="32,25 32,55 58,40"/></g><text x="150" y="270" fill="%2364748b" font-family="sans-serif" font-size="14" text-anchor="middle" font-weight="600">No Image Available</text></svg>';
  const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="%231e293b"><circle cx="50" cy="35" r="20" fill="%23475569"/><path d="M10 90 C10 65 30 55 50 55 C70 55 90 65 90 90 Z" fill="%23475569"/></svg>';

  // Global Application State
  const state = {
    allShows: [],           // Master array of fetched shows
    filteredShows: [],      // Filtered & sorted shows
    genres: new Set(),      // Extracted genres set
    selectedGenre: 'all',   // Active genre filter
    searchQuery: '',        // Current search text
    sortBy: 'rating-desc',  // Active sort option
    debounceTimer: null,    // Debounce timer for live search
    isLoading: false,       // Loading flag
  };

  // Cached DOM Elements
  const elements = {
    showsGrid: document.getElementById('showsGrid'),
    skeletonGrid: document.getElementById('skeletonGrid'),
    emptyState: document.getElementById('emptyState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    resultsBadge: document.getElementById('resultsBadge'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    genreContainer: document.getElementById('genreContainer'),
    sortSelect: document.getElementById('sortSelect'),
    resetSearchBtn: document.getElementById('resetSearchBtn'),
    retryBtn: document.getElementById('retryBtn'),
    heroRandomBtn: document.getElementById('heroRandomBtn'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    modalContainer: document.getElementById('modalContainer'),
    modalContent: document.getElementById('modalContent'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
  };

  /**
   * DOMContentLoaded Entry Point - Loads Default Popular Shows
   */
  document.addEventListener('DOMContentLoaded', () => {
    init();
  });

  /**
   * Initialize App Components & Listeners
   */
  async function init() {
    bindEvents();
    await loadDefaultShows();
  }

  /**
   * 1. LOADING STATE: Render Tailwind Skeleton Cards
   */
  function renderSkeletons() {
    elements.skeletonGrid.innerHTML = '';
    const skeletonCount = 10;
    for (let i = 0; i < skeletonCount; i++) {
      const skeletonCard = document.createElement('div');
      skeletonCard.className = 'bg-slate-900/80 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg animate-pulse flex flex-col h-[420px]';
      skeletonCard.innerHTML = `
        <div class="h-64 bg-slate-800/60 w-full relative"></div>
        <div class="p-4 flex flex-col justify-between flex-grow space-y-3">
          <div class="h-5 bg-slate-800/80 rounded-md w-3/4"></div>
          <div class="flex items-center gap-2">
            <div class="h-4 bg-slate-800/80 rounded-md w-1/4"></div>
            <div class="h-4 bg-slate-800/80 rounded-md w-1/3"></div>
          </div>
          <div class="h-10 bg-slate-800/80 rounded-xl w-full mt-auto"></div>
        </div>
      `;
      elements.skeletonGrid.appendChild(skeletonCard);
    }
    showElement(elements.skeletonGrid);
    hideElement(elements.showsGrid);
    hideElement(elements.emptyState);
    hideElement(elements.errorState);
  }

  /**
   * DEFAULT VIEW: Fetch Popular Shows on DOM Load
   */
  async function loadDefaultShows() {
    state.isLoading = true;
    renderSkeletons();
    elements.resultsBadge.textContent = 'Fetching...';

    try {
      const rawData = await window.TVMazeAPI.getPopularShows();
      state.allShows = rawData.map(item => normalizeShowData(item));
      extractGenres(state.allShows);
      renderGenrePills();
      applyFiltersAndSort();
    } catch (error) {
      console.error('Error fetching popular shows:', error);
      showErrorState(`Unable to load TV shows (${error.message}). Please verify your network connection.`);
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * SEARCH FUNCTION: Perform API Search with Debouncing
   * @param {string} query 
   */
  async function performSearch(query) {
    if (!query.trim()) {
      await loadDefaultShows();
      return;
    }

    state.isLoading = true;
    renderSkeletons();
    elements.resultsBadge.textContent = 'Searching...';

    try {
      const rawData = await window.TVMazeAPI.searchShows(query);
      state.allShows = rawData.map(item => normalizeShowData(item));
      extractGenres(state.allShows);
      renderGenrePills();
      applyFiltersAndSort();
    } catch (error) {
      console.error('Error searching shows:', error);
      showErrorState(`Failed to fetch search results for "${query}". ${error.message}`);
    } finally {
      state.isLoading = false;
    }
  }

  /**
   * Data Normalization Helper
   * @param {Object} show 
   */
  function normalizeShowData(show) {
    if (!show) return {};
    return {
      id: show.id,
      name: show.name || 'Untitled Show',
      image: show.image?.medium || show.image?.original || PLACEHOLDER_POSTER,
      imageLarge: show.image?.original || show.image?.medium || PLACEHOLDER_POSTER,
      rating: show.rating?.average ? show.rating.average.toFixed(1) : 'N/A',
      ratingVal: show.rating?.average || 0,
      premiered: show.premiered ? show.premiered.substring(0, 4) : 'N/A',
      premieredDate: show.premiered || '',
      genres: Array.isArray(show.genres) ? show.genres : [],
      summary: show.summary || 'No overview summary available for this show.',
      network: show.network?.name || show.webChannel?.name || 'Unknown Network',
      status: show.status || 'Unknown',
      language: show.language || 'English',
      runtime: show.runtime ? `${show.runtime} mins` : 'N/A',
      officialSite: show.officialSite || show.url || '#',
    };
  }

  /**
   * Extract Available Genres
   * @param {Array} shows 
   */
  function extractGenres(shows) {
    state.genres.clear();
    shows.forEach(show => {
      if (show.genres && show.genres.length > 0) {
        show.genres.forEach(g => state.genres.add(g));
      }
    });
  }

  /**
   * Render Genre Pills Bar
   */
  function renderGenrePills() {
    const sortedGenres = Array.from(state.genres).sort();
    
    let html = `
      <button data-genre="all" class="genre-pill ${state.selectedGenre === 'all' ? 'active' : ''} whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all">
        All Genres (${state.allShows.length})
      </button>
    `;

    sortedGenres.forEach(genre => {
      const count = state.allShows.filter(s => s.genres && s.genres.includes(genre)).length;
      if (count > 0) {
        const isActive = state.selectedGenre === genre;
        html += `
          <button data-genre="${escapeHtml(genre)}" class="genre-pill ${isActive ? 'active' : ''} whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all">
            ${escapeHtml(genre)} (${count})
          </button>
        `;
      }
    });

    elements.genreContainer.innerHTML = html;
  }

  /**
   * Filter & Sort Shows
   */
  function applyFiltersAndSort() {
    let result = [...state.allShows];

    if (state.selectedGenre !== 'all') {
      result = result.filter(show => show.genres && show.genres.includes(state.selectedGenre));
    }

    switch (state.sortBy) {
      case 'rating-desc':
        result.sort((a, b) => b.ratingVal - a.ratingVal);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'year-desc':
        result.sort((a, b) => (b.premieredDate || '').localeCompare(a.premieredDate || ''));
        break;
      case 'year-asc':
        result.sort((a, b) => (a.premieredDate || '').localeCompare(b.premieredDate || ''));
        break;
    }

    state.filteredShows = result;
    renderShowsGrid(result);
  }

  /**
   * Dynamic Show Grid Renderer
   * Handles Empty State, Cards State & Results Badge
   * @param {Array} shows 
   */
  function renderShowsGrid(shows) {
    hideElement(elements.skeletonGrid);
    hideElement(elements.errorState);

    // 2. EMPTY STATE: Show 'No shows found' if empty
    if (shows.length === 0) {
      hideElement(elements.showsGrid);
      showElement(elements.emptyState);
      elements.resultsBadge.textContent = '0 Shows';
      return;
    }

    hideElement(elements.emptyState);
    showElement(elements.showsGrid);
    elements.resultsBadge.textContent = `${shows.length} ${shows.length === 1 ? 'Show' : 'Shows'}`;

    // Render cards list dynamically
    elements.showsGrid.innerHTML = shows.map(show => createShowCardHtml(show)).join('');
  }

  /**
   * Build HTML for Individual Show Card
   * Requirements: Poster (or fallback), Title, Rating, Genres tags, Language & Status, View Details button
   * @param {Object} show 
   * @returns {string} Card HTML
   */
  function createShowCardHtml(show) {
    // Genres tags
    const genreTags = show.genres && show.genres.length > 0
      ? show.genres.slice(0, 3).map(g => `<span class="text-[10px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-md font-medium">${escapeHtml(g)}</span>`).join(' ')
      : '<span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-medium">General</span>';

    // Rating Badge (show.rating)
    const ratingDisplay = show.rating !== 'N/A' 
      ? `<span class="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-lg"><i class="fa-solid fa-star text-[10px]"></i> ${show.rating}</span>`
      : `<span class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-lg">Unrated</span>`;

    return `
      <article class="show-card bg-brand-cardBg border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full group hover:border-brand-500/50 transition-all duration-300" data-id="${show.id}">
        
        <!-- Show Poster Image (or Fallback if null) -->
        <div class="relative aspect-[2/3] overflow-hidden bg-slate-900">
          <img 
            src="${show.image}" 
            alt="${escapeHtml(show.name)}"
            class="poster-img w-full h-full object-cover"
            loading="lazy"
            onerror="this.onerror=null; this.src='${PLACEHOLDER_POSTER}';"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
          
          <!-- Rating Badge Floating -->
          <div class="absolute top-3 right-3 z-10">
            ${ratingDisplay}
          </div>

          <!-- Premiered Year Floating -->
          <div class="absolute top-3 left-3 z-10">
            <span class="text-[11px] font-semibold text-slate-200 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-2 py-0.5 rounded-lg">
              📅 ${show.premiered}
            </span>
          </div>
        </div>

        <!-- Card Body Details -->
        <div class="p-4 flex flex-col justify-between flex-grow space-y-3">
          <div>
            <!-- Genres Joined as Tags -->
            <div class="flex flex-wrap gap-1 mb-2">
              ${genreTags}
            </div>

            <!-- Show Title -->
            <h3 class="font-heading font-bold text-base text-white group-hover:text-brand-500 transition-colors line-clamp-1 mb-1.5" title="${escapeHtml(show.name)}">
              ${escapeHtml(show.name)}
            </h3>

            <!-- Language & Status -->
            <div class="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-globe text-[11px] text-emerald-400"></i> ${escapeHtml(show.language)}
              </span>
              <span class="px-2 py-0.5 bg-slate-800/90 text-slate-300 rounded-md text-[10px] font-semibold border border-slate-700/50">
                ${escapeHtml(show.status)}
              </span>
            </div>
          </div>

          <!-- View Details Button -->
          <button 
            type="button"
            class="see-details-btn w-full bg-slate-800/90 hover:bg-brand-600 text-slate-200 hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700/80 hover:border-brand-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-md group-hover:shadow-brand-600/30"
            data-id="${show.id}"
          >
            <span>View Details</span>
            <i class="fa-solid fa-circle-info text-[11px] group-hover:scale-110 transition-transform"></i>
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Helper to safely sanitize and render show summary HTML
   * @param {string} html 
   * @returns {string} Safe HTML string
   */
  function sanitizeSummary(html) {
    if (!html || typeof html !== 'string') {
      return '<p class="text-slate-400 italic">No summary description available for this show.</p>';
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Strip potentially harmful elements
      const elementsToRemove = doc.querySelectorAll('script, iframe, object, embed, style, link, form, input, button');
      elementsToRemove.forEach(el => el.remove());
      
      const cleanContent = doc.body.innerHTML.trim();
      return cleanContent || '<p class="text-slate-400 italic">No summary description available for this show.</p>';
    } catch (e) {
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  }

  /**
   * Modal Details Drawer Opener
   * Fetches full Show Details with embedded cast via window.TVMazeAPI.getShowDetails(showId)
   * @param {number|string} showId 
   */
  async function openModal(showId) {
    // Show spinner inside modal container
    elements.modalContent.innerHTML = `
      <div class="p-16 text-center space-y-4">
        <div class="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-sm font-semibold text-slate-300">Fetching show details & cast members...</p>
      </div>
    `;

    // Display Modal with smooth transitions
    elements.modalBackdrop.classList.add('active');
    elements.modalContainer.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      // 1. Fetch full show details with embedded cast from TVMaze API
      const fullDetails = await window.TVMazeAPI.getShowDetails(showId);
      const show = normalizeShowData(fullDetails);
      const castList = fullDetails._embedded?.cast || [];

      // Format Genre Pills
      const genrePills = show.genres.map(g => 
        `<span class="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full font-medium">${escapeHtml(g)}</span>`
      ).join(' ');

      // Format Rating Badge
      const ratingBadge = show.rating !== 'N/A'
        ? `<span class="inline-flex items-center gap-1.5 text-sm font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full"><i class="fa-solid fa-star text-xs"></i> ${show.rating} / 10</span>`
        : `<span class="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Unrated</span>`;

      // Safe HTML Summary
      const safeSummary = sanitizeSummary(show.summary);

      // Format Premiered Date
      const premieredDisplay = show.premieredDate || show.premiered || 'N/A';

      // Format Cast List (Top 6 members with fallback avatar)
      const castHtml = castList.length > 0 
        ? castList.slice(0, 6).map(member => `
            <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <img 
                src="${member.person?.image?.medium || PLACEHOLDER_AVATAR}" 
                alt="${escapeHtml(member.person?.name || 'Actor')}" 
                class="w-11 h-11 rounded-full object-cover border border-slate-700/80 flex-shrink-0"
                loading="lazy"
                onerror="this.onerror=null; this.src='${PLACEHOLDER_AVATAR}';"
              />
              <div class="min-w-0 flex-1">
                <span class="block text-xs font-bold text-white truncate" title="${escapeHtml(member.person?.name || 'Actor')}">
                  ${escapeHtml(member.person?.name || 'Actor')}
                </span>
                <span class="block text-[11px] text-slate-400 truncate" title="as ${escapeHtml(member.character?.name || 'Character')}">
                  as ${escapeHtml(member.character?.name || 'Character')}
                </span>
              </div>
            </div>
          `).join('')
        : '<p class="text-xs text-slate-500 italic col-span-full">No cast information available for this show.</p>';

      elements.modalContent.innerHTML = `
        <!-- Modal Banner & Poster Header -->
        <div class="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img 
            src="${show.imageLarge}" 
            alt="${escapeHtml(show.name)}"
            class="w-full h-full object-cover object-top opacity-40 blur-xs scale-105"
            onerror="this.onerror=null; this.src='${PLACEHOLDER_POSTER}';"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-modalBg via-brand-modalBg/70 to-transparent"></div>
          
          <!-- Header Overlay Details -->
          <div class="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div class="w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 flex-shrink-0 bg-slate-900 hidden sm:block">
              <img 
                src="${show.image}" 
                alt="${escapeHtml(show.name)}"
                class="w-full h-full object-cover"
                onerror="this.onerror=null; this.src='${PLACEHOLDER_POSTER}';"
              />
            </div>
            <div class="space-y-2 max-w-xl">
              <div class="flex flex-wrap items-center gap-2">
                ${ratingBadge}
                <span class="text-xs bg-slate-800/90 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-medium">
                  ${escapeHtml(show.status)}
                </span>
              </div>
              <h2 class="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                ${escapeHtml(show.name)}
              </h2>
            </div>
          </div>
        </div>

        <!-- Modal Body Details -->
        <div class="p-6 sm:p-8 space-y-6">
          
          <!-- Metadata Info Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl text-xs">
            <div>
              <span class="text-slate-400 block mb-1">Premiered</span>
              <span class="font-semibold text-white flex items-center gap-1.5">
                <i class="fa-solid fa-calendar text-brand-500"></i> ${escapeHtml(premieredDisplay)}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block mb-1">Network</span>
              <span class="font-semibold text-white flex items-center gap-1.5 line-clamp-1">
                <i class="fa-solid fa-tv text-brand-cyan"></i> ${escapeHtml(show.network)}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block mb-1">Runtime</span>
              <span class="font-semibold text-white flex items-center gap-1.5">
                <i class="fa-solid fa-clock text-brand-accent"></i> ${escapeHtml(show.runtime)}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block mb-1">Language</span>
              <span class="font-semibold text-white flex items-center gap-1.5">
                <i class="fa-solid fa-globe text-emerald-400"></i> ${escapeHtml(show.language)}
              </span>
            </div>
          </div>

          <!-- Genres List -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs text-slate-400 font-semibold mr-1">Genres:</span>
            ${genrePills || '<span class="text-xs text-slate-500">None specified</span>'}
          </div>

          <!-- Overview & Summary (Rendered Safely) -->
          <div>
            <h4 class="font-heading text-sm uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-2">
              <i class="fa-solid fa-align-left text-brand-500"></i> Overview & Plot Summary
            </h4>
            <div class="summary-content bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 leading-relaxed">
              ${safeSummary}
            </div>
          </div>

          <!-- Embedded Cast Members -->
          <div>
            <h4 class="font-heading text-sm uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-user-group text-brand-cyan"></i> Featured Cast Members
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${castHtml}
            </div>
          </div>

          <!-- Action Footer inside Modal -->
          <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <a 
              href="${escapeHtml(show.officialSite)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-600 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-brand-600/30 transition-all duration-300"
            >
              <span>Visit Official Site</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
            <button 
              type="button" 
              onclick="document.getElementById('modalCloseBtn').click()" 
              class="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-all"
            >
              Close Window
            </button>
          </div>

        </div>
      `;
    } catch (error) {
      console.error('Error fetching modal details:', error);
      elements.modalContent.innerHTML = `
        <div class="p-8 text-center space-y-4">
          <div class="w-12 h-12 bg-red-900/40 text-red-400 rounded-full flex items-center justify-center text-xl mx-auto">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h4 class="font-bold text-white text-base">Error Loading Show Details</h4>
          <p class="text-xs text-slate-400">${escapeHtml(error.message)}</p>
          <button onclick="document.getElementById('modalCloseBtn').click()" class="bg-slate-800 text-white text-xs px-4 py-2 rounded-xl">Close</button>
        </div>
      `;
    }
  }

  /**
   * Close Modal Drawer
   */
  function closeModal() {
    elements.modalBackdrop.classList.remove('active');
    elements.modalContainer.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Debounce Utility Function
   * Delays the execution of a function until after `delay` milliseconds
   * have elapsed since the last time the debounced function was invoked.
   *
   * @param {Function} func - The target function to debounce
   * @param {number} delay - The debounce delay in milliseconds (e.g. 400ms)
   * @returns {Function} Debounced function with .cancel() method
   */
  function debounce(func, delay = 400) {
    let timerId = null;

    const debouncedFn = function (...args) {
      const context = this;
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func.apply(context, args);
        timerId = null;
      }, delay);
    };

    debouncedFn.cancel = function () {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    return debouncedFn;
  }

  /**
   * Bind Event Listeners
   */
  function bindEvents() {
    // Connect search input with 400ms debounce
    const handleSearchDebounced = debounce((query) => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        loadDefaultShows();
      }
    }, 400);

    // Search input event
    elements.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.searchQuery = val;

      if (val.trim()) {
        showElement(elements.clearSearchBtn);
      } else {
        hideElement(elements.clearSearchBtn);
      }

      handleSearchDebounced(val);
    });

    // Clear search button
    elements.clearSearchBtn.addEventListener('click', () => {
      handleSearchDebounced.cancel();
      elements.searchInput.value = '';
      state.searchQuery = '';
      hideElement(elements.clearSearchBtn);
      loadDefaultShows();
    });

    // Genre filter click delegation
    elements.genreContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-genre]');
      if (!btn) return;

      const genre = btn.getAttribute('data-genre');
      state.selectedGenre = genre;

      const pills = elements.genreContainer.querySelectorAll('.genre-pill');
      pills.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      applyFiltersAndSort();
    });

    // Sort dropdown change
    elements.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      applyFiltersAndSort();
    });

    // Card click delegation for "View Details"
    elements.showsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (!card) return;
      const showId = card.getAttribute('data-id');
      openModal(showId);
    });

    // Hero Random Show Button
    elements.heroRandomBtn.addEventListener('click', () => {
      if (state.allShows.length > 0) {
        const randomIndex = Math.floor(Math.random() * state.allShows.length);
        const randomShow = state.allShows[randomIndex];
        openModal(randomShow.id);
      }
    });

    // Reset search button on empty state
    elements.resetSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      state.selectedGenre = 'all';
      hideElement(elements.clearSearchBtn);
      loadDefaultShows();
    });

    // 3. ERROR STATE: Retry Button
    elements.retryBtn.addEventListener('click', () => {
      loadDefaultShows();
    });

    // Modal close controls
    elements.modalCloseBtn.addEventListener('click', closeModal);

    // Close modal when clicking backdrop outside modal container
    elements.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.modalBackdrop) {
        closeModal();
      }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });
  }

  /**
   * 3. ERROR STATE Handler
   */
  function showErrorState(msg) {
    hideElement(elements.skeletonGrid);
    hideElement(elements.showsGrid);
    hideElement(elements.emptyState);
    if (elements.errorMessage) elements.errorMessage.textContent = msg;
    showElement(elements.errorState);
  }

  function showElement(el) {
    if (el) el.classList.remove('hidden');
  }

  function hideElement(el) {
    if (el) el.classList.add('hidden');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
