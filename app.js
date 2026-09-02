/* Movie Search — app.js
   Step 2: TMDB API & movie search.
   Step 3: request states & error handling.

   API_KEY is a TMDB v3 key. It is intentionally visible here — this is a
   client-side learning project with no backend, so there is nowhere else
   to put it. See README for what that tradeoff means and how a real
   production app would avoid it (a server-side proxy). */

const API_KEY = "cf2f001187227d668edabb88db69fe47";
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342"; // poster size, from TMDB's /configuration response
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780"; // wider still, used for the hover background

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const resultsCount = document.getElementById("results-count");
const retryButton = document.getElementById("retry-button");
const ambient = document.getElementById("ambient");
const spotlight = document.getElementById("spotlight");
const spotlightGenres = document.getElementById("spotlight-genres");
const spotlightTitle = document.getElementById("spotlight-title");
const spotlightOverview = document.getElementById("spotlight-overview");

// Search results only carry numeric genre_ids — fetched once here and
// mapped to names, rather than guessing them or calling per hover.
const genreMap = new Map();
fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=en-US`)
  .then((res) => res.json())
  .then((data) => data.genres.forEach((g) => genreMap.set(g.id, g.name)))
  .catch(console.error); // non-critical — search still works without it

// The five containers Step 1 already built and styled — exactly one of
// these is visible at a time.
const states = {
  initial: document.getElementById("state-initial"),
  loading: document.getElementById("state-loading"),
  empty: document.getElementById("state-empty"),
  error: document.getElementById("state-error"),
  results: document.getElementById("state-results"),
};

function showState(name) {
  for (const key in states) {
    states[key].hidden = key !== name;
  }
}

/**
 * Ask TMDB for movies matching `query` and return its `results` array.
 * Field names below (title, release_date, vote_average, vote_count,
 * poster_path) come straight from a real /search/movie response —
 * inspected with curl before writing this, not guessed.
 */
async function searchMovies(query) {
  const url = `${API_BASE}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  const data = await response.json();
  // Skip movies TMDB has no poster for — this is a poster grid, and an
  // empty card doesn't serve that — then cap it at 12 for a tidy grid.
  return data.results.filter((movie) => movie.poster_path).slice(0, 12);
}

/** Turn one TMDB movie object into a card's HTML. */
function renderCard(movie) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  // vote_count can be 0 for movies TMDB has no ratings for yet — showing
  // "0.0" there would read as a real (bad) score, so show "—" instead.
  const rating = movie.vote_count > 0 ? movie.vote_average.toFixed(1) : "—";
  // searchMovies() already filters out posterless movies, so poster_path
  // is always present here.
  const poster = `url('${IMAGE_BASE}${movie.poster_path}')`;

  return `
    <article class="card">
      <div class="card__poster" style="--poster: ${poster};">
        <h3 class="card__title">${escapeHtml(movie.title)}</h3>
      </div>
      <div class="card__meta">
        <span class="card__year">${year}</span>
        <span class="card__rating"><svg class="card__star" width="13" height="13"><use href="#icon-star"></use></svg>${rating}</span>
      </div>
    </article>
  `;
}

// Titles come from TMDB and can contain characters like & or < — escape
// them before they go into innerHTML.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResults(movies) {
  resultsGrid.innerHTML = movies.map(renderCard).join("");
  resultsCount.textContent = `${movies.length} title${movies.length === 1 ? "" : "s"}`;

  // Wire up the background/details-bar hover effect. Cards are re-created
  // on every search, so listeners are (re)attached here rather than once.
  resultsGrid.querySelectorAll(".card").forEach((card, i) => {
    card.addEventListener("mouseenter", () => showSpotlight(movies[i]));
    card.addEventListener("mouseleave", hideSpotlight);
  });
}

/** Crossfade the background to `movie`'s backdrop and show a few details. */
function showSpotlight(movie) {
  if (movie.backdrop_path) {
    ambient.style.setProperty("--backdrop", `url('${BACKDROP_BASE}${movie.backdrop_path}')`);
    ambient.classList.add("is-active");
  }

  const genres = (movie.genre_ids || [])
    .map((id) => genreMap.get(id))
    .filter(Boolean)
    .join(" · ");

  spotlightGenres.textContent = genres;
  spotlightTitle.textContent = movie.title;
  spotlightOverview.textContent = movie.overview || "";
  spotlight.classList.add("is-active");
}

function hideSpotlight() {
  ambient.classList.remove("is-active");
  spotlight.classList.remove("is-active");
}

let lastQuery = "";
let requestId = 0; // guards against a slow, stale response overwriting a newer search

async function runSearch(query) {
  lastQuery = query;
  showState("loading");
  const thisRequest = ++requestId;

  try {
    const movies = await searchMovies(query);
    if (thisRequest !== requestId) return; // a newer search started since this one fired

    if (movies.length === 0) {
      showState("empty");
      return;
    }
    renderResults(movies);
    showState("results");
  } catch (err) {
    if (thisRequest !== requestId) return;
    console.error(err);
    showState("error");
  }
}

// --- Live search, debounced so a request only fires once typing pauses.
let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();

  if (!query) {
    requestId++; // invalidate any in-flight request — its result is now moot
    showState("initial");
    return;
  }

  debounceTimer = setTimeout(() => runSearch(query), 400);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // this is a live-search box, not a submit-driven form
});

retryButton.addEventListener("click", () => {
  if (lastQuery) runSearch(lastQuery);
});

showState("initial"); // nothing searched yet
