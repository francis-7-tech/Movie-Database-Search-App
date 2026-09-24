const API_KEY = "cf2f001187227d668edabb88db69fe47";
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w342"; 
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780"; 

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

// TMDB search results only give genre numbers (like 28), not names (like "Action").
// So we download the full list of genres once when the app starts and keep it here.
const genreMap = new Map();
fetch(`${API_BASE}/genre/movie/list?api_key=${API_KEY}&language=en-US`)
  .then((res) => res.json())
  .then((data) => data.genres.forEach((g) => genreMap.set(g.id, g.name)))
  .catch(console.error); // If this fails, search still works, just without genre names
  
// The five states
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

// Search TMDB and return up to 12 movies that have posters.
async function searchMovies(query) {
  const url = `${API_BASE}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  const data = await response.json();
  // Filter to only 12 movies
  return data.results.filter((movie) => movie.poster_path).slice(0, 12);
}

// Builds the HTML for one movie card.
function renderCard(movie) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  // If nobody has rated the movie yet, show "—" instead of "0.0",
  // so it doesn't look like a badly rated movie.
  const rating = movie.vote_count > 0 ? movie.vote_average.toFixed(1) : "—";
  // No need to check for a missing poster here.
  // searchMovies() already removed movies without one.
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

// Movie titles can contain symbols like & or < that the browser might read as code.
// This turns them into safe text before they go onto the page.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderResults(movies) {
  resultsGrid.innerHTML = movies.map(renderCard).join("");
  resultsCount.textContent = `${movies.length} title${movies.length === 1 ? "" : "s"}`;

  // When you hover over a card, show that movie's background and details bar.
  // Every new search creates brand-new cards, so the hover effect has to be
  // added again each time.
  resultsGrid.querySelectorAll(".card").forEach((card, i) => {
    card.addEventListener("mouseenter", () => showSpotlight(movies[i]));
    card.addEventListener("mouseleave", hideSpotlight);
  });
}

// When you hover a card, fade in that movie's background image and show its details. 
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

// Each search gets a number. If an older search finishes late,
// we can tell it's out of date and ignore its results.
let requestId = 0; 

async function runSearch(query) {
  lastQuery = query;
  showState("loading");
  const thisRequest = ++requestId;

  try {
    const movies = await searchMovies(query);
    // The user has searched for something else since this one started,
    // so these results are old. Ignore them.
    if (thisRequest !== requestId) return; 

    if (movies.length === 0) {
      showState("empty");
      return;
    }
    renderResults(movies);
    showState("results");
  } catch (err) {
    // Same check here: don't show an error for an old search.
    if (thisRequest !== requestId) return;
    console.error(err);
    showState("error");
  }
}

// --- Search as you type, but wait until the user pauses before searching.
// This stops us from sending a request for every single letter.
let debounceTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();

  if (!query) {
    // The box is empty now, so ignore any search that's still loading.
    requestId++; 
    return;
  }

  debounceTimer = setTimeout(() => runSearch(query), 400);
});

searchForm.addEventListener("submit", (event) => {
   // Stop Enter from reloading the page. Results already appear as you type.
  event.preventDefault(); 
});

// On the error screen, "Try again" repeats the last search.
retryButton.addEventListener("click", () => {
  if (lastQuery) runSearch(lastQuery);
});

// Show the starting screen when the page first loads.
showState("initial"); 
