# 📺 ShowPulse — TV Shows Explorer

A modern, responsive **TV Shows Explorer** web application built with **HTML5**, **Tailwind CSS v3**, and **Vanilla JavaScript**, powered by the free [TVMaze Open API](https://www.tvmaze.com/api).

🔗 **Live Demo:** [showpulse.vercel.app](https://movie-explorer-nilaraninath.vercel.app)  
📁 **GitHub Repo:** [github.com/NilaRaniNath/Movie-explorer](https://github.com/NilaRaniNath/Movie-explorer)

---

## 🚀 Features

- 🔍 **Live Search** — Real-time debounced (400ms) TV show search powered by TVMaze API
- 🎬 **Browse Popular Shows** — Default grid of popular shows loaded on page open
- 🏷️ **Dynamic Genre Filters** — Filter shows by genre with auto-generated pill buttons
- ⭐ **Sorting** — Sort by Top Rated, Name (A–Z), or Premiered Year
- 🃏 **Show Cards** — Poster image, title, rating, genres, language & status on each card
- 🪟 **Detailed Modal Popup** — Click "View Details" to see:
  - Show banner & poster thumbnail
  - Full title, rating, premiered date, network, runtime, language
  - Genre tags
  - Safe HTML overview/plot summary
  - Embedded cast members list with photos
  - Official site link
- 🎲 **Surprise Me Button** — Opens a random show's details
- ⏳ **Loading Skeleton** — Animated skeleton cards while data is fetching
- 🚫 **Empty State** — "No Shows Found" UI when search returns no results
- ❌ **Error State** — Friendly error message with retry button on API failure
- 📱 **Fully Responsive** — Mobile-first layout adapting from 1 to 5 columns
- ♿ **Accessible** — Keyboard navigation (`Escape` to close modal), ARIA labels

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| [Tailwind CSS v3 (CDN)](https://cdn.tailwindcss.com) | Utility-first styling & dark mode |
| Vanilla JavaScript (ES6+) | DOM manipulation & API logic |
| [TVMaze Open API](https://www.tvmaze.com/api) | Live TV show data (no API key required) |
| [Google Fonts](https://fonts.google.com) | Inter & Outfit typefaces |
| [Font Awesome 6](https://fontawesome.com) | Icons |
| [Vercel](https://vercel.com) | Static site deployment |

---

## 📁 Project Structure

```
Movie-explorer/
├── index.html        # Main HTML page — layout, header, search, grid, modal, footer
├── styles.css        # Custom CSS — animations, genre pills, modal transitions, scrollbars
├── api.js            # TVMaze API service module (searchShows, getPopularShows, getShowDetails)
├── app.js            # App logic — DOM rendering, UI states, debounced search, modal
├── vercel.json       # Vercel deployment configuration
└── README.md         # Project documentation
```

---

## 🌐 API Reference (TVMaze)

All data is fetched from the free, public [TVMaze REST API](https://www.tvmaze.com/api) — **no API key required**.

| Function | Endpoint |
|---|---|
| `getPopularShows()` | `GET https://api.tvmaze.com/shows` |
| `searchShows(query)` | `GET https://api.tvmaze.com/search/shows?q={query}` |
| `getShowDetails(id)` | `GET https://api.tvmaze.com/shows/{id}?embed=cast` |

---

## ⚙️ Running Locally

No build tools or package manager needed.

```bash
# Clone the repository
git clone https://github.com/NilaRaniNath/Movie-explorer.git

# Navigate to the project folder
cd Movie-explorer

# Open index.html in your browser OR use a local server:
npx serve .
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Screenshots

### Home / Hero Section
![Hero Section](https://github.com/NilaRaniNath/Movie-explorer/raw/main/screenshots/hero.png)

### TV Show Cards Grid
![Shows Grid](https://github.com/NilaRaniNath/Movie-explorer/raw/main/screenshots/grid.png)

### Show Details Modal
![Show Details Modal](https://github.com/NilaRaniNath/Movie-explorer/raw/main/screenshots/modal.png)

---

## 📱 Responsive Breakpoints

| Screen | Grid Columns |
|---|---|
| Mobile (`< 640px`) | 1 column |
| Tablet (`640px+`) | 2 columns |
| Laptop (`768px+`) | 3 columns |
| Desktop (`1024px+`) | 4 columns |
| Wide (`1280px+`) | 5 columns |

---

## 🎓 Assignment Details

This project was built as part of the **Foundation Program — Assignment 2** at [Programming Hero](https://programming-hero.com/).

**Submission Deadline:**
- 60 Marks: September 17, 2026, 11:59 PM
- 50 Marks: September 18, 2026, 11:59 PM

---

## 👩‍💻 Author

**Nila Rani Nath**  
GitHub: [@NilaRaniNath](https://github.com/NilaRaniNath)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
