# Movie Search App

A simple movie search app built with plain HTML, CSS, and JavaScript.
It uses the [TMDB](https://www.themoviedb.org/) API to search for movies and show their poster, release year, and rating.

This was built as a learning project — the goal was to practice working with a real external API: `fetch`, `async/await`, JSON, and handling the different states a network request can be in.

## Features

- Live search as you type, debounced so it doesn't fire a request on every keystroke
- Movie cards with poster, title, release year, and rating
- Four request states: initial prompt, loading (animated skeleton cards), no results, and error (with a retry button)
- Dark, cinematic design with animated hover on the cards
- Hovering a card also changes the page background to that movie's backdrop image and shows its genre and a short synopsis
- Responsive layout

## How to run it

No install and no build step — just open `index.html` in a browser.

If the posters don't load, your browser may be blocking requests from a file opened directly from disk. In that case, serve the folder with a simple local server instead (e.g. the "Live Server" extension in VS Code) and open it from there.

## About the API key

The TMDB API key in `app.js` is visible in the code, so anyone can find it by viewing the page source. That's an acceptable tradeoff for a learning project with no backend — but not for a real product. In a production app, the key should live on a server instead, so the browser never sees it.

## Built with

- Plain HTML, CSS, and JavaScript — no frameworks, no build tools
- Chakra Petch and Inter fonts (Google Fonts)
- [TMDB API](https://www.themoviedb.org/documentation/api)

## What's next

- A "Trending Movies" row, planned but not added yet
- A final responsiveness and cleanup pass

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
