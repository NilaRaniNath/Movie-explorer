/**
 * TVMaze API Service Module
 * Base URL: https://api.tvmaze.com
 */

const BASE_URL = 'https://api.tvmaze.com';

/**
 * Searches for TV shows matching a search query string.
 * Endpoint: GET /search/shows?q=:query
 * 
 * @param {string} query - Search keyword (e.g. "girls", "breaking")
 * @returns {Promise<Array>} Array of show objects
 */
async function searchShows(query) {
  if (!query || !query.trim()) {
    return getPopularShows();
  }

  try {
    const url = `${BASE_URL}/search/shows?q=${encodeURIComponent(query.trim())}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to search shows for "${query}"`);
    }

    const data = await response.json();
    // TVMaze search endpoint returns an array of [{ score: number, show: Object }]
    return data.map(item => item.show);
  } catch (error) {
    console.error(`[TVMaze API] searchShows error:`, error);
    throw error;
  }
}

/**
 * Fetches default list of TV shows.
 * Endpoint: GET /shows
 * 
 * @returns {Promise<Array>} Array of show objects
 */
async function getPopularShows() {
  try {
    const url = `${BASE_URL}/shows`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch popular shows`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[TVMaze API] getPopularShows error:`, error);
    throw error;
  }
}

/**
 * Fetches detailed information for a specific show ID, including embedded cast data.
 * Endpoint: GET /shows/:id?embed=cast
 * 
 * @param {number|string} id - TVMaze show ID
 * @returns {Promise<Object>} Detailed show object with `_embedded.cast` array
 */
async function getShowDetails(id) {
  if (!id) {
    throw new Error('Show ID is required to fetch details.');
  }

  try {
    const url = `${BASE_URL}/shows/${id}?embed=cast`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch details for show ID ${id}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[TVMaze API] getShowDetails error (ID: ${id}):`, error);
    throw error;
  }
}

// Global window registration for vanilla JS script tag support
if (typeof window !== 'undefined') {
  window.TVMazeAPI = {
    searchShows,
    getPopularShows,
    getShowDetails,
  };
}

// Module export for ES modules / CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchShows,
    getPopularShows,
    getShowDetails,
  };
}
