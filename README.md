# Movie Search App

A simple movie search app built with plain HTML, CSS, and JavaScript.
It uses the [TMDB](https://www.themoviedb.org/) API to search for movies and show their poster, release year, and rating.

This was built as a learning project — the goal was to practice working with a real external API: `fetch`, `async/await`, JSON, and handling the different states a network request can be in.

## Features

- Live search as you type, debounced by 400ms so it doesn't fire a request on every keystroke
- Movie cards with poster, title, release year, and rating
- Five screens, with exactly one visible at a time: the opening prompt, loading (animated skeleton cards), no results, error (with a retry button), and the results grid
- Out-of-date responses are ignored, so a slow earlier search can't overwrite the results of a newer one
- Movie titles are escaped before they go on the page, so characters like `&` and `<` can't break the markup
- Ratings show `—` rather than `0.0` when nobody has rated a film yet
- Dark, cinematic design with animated hover on the cards
- Hovering a card also changes the page background to that movie's backdrop image and shows its genre and a short synopsis
- Responsive layout, and it respects the operating system's "reduce motion" setting

## Project structure

| File | What it is |
| --- | --- |
| `index.html` | All the markup — the five screens, plus an SVG icon sprite at the top |
| `styles.css` | All the styling. Design tokens live in `:root` at the top |
| `app.js` | All the behaviour — searching, rendering cards, and switching screens |
| `eslint.config.mjs` | ESLint rules (development only) |
| `package.json` | The `lint` script and the dev tools it needs |
| `.vscode/settings.json` | Pins Live Server to port 5501 |
| `.gitignore` | Keeps `node_modules/` out of the repo |

The three files at the top are the whole app. Everything below them is tooling and never reaches the browser.

## How to run it

No install and no build step — just open `index.html` in a browser.

If the posters don't load, your browser may be blocking requests from a file opened directly from disk. In that case, serve the folder with a simple local server instead (e.g. the "Live Server" extension in VS Code) and open it from there. This project pins Live Server to port 5501, so it opens at `http://127.0.0.1:5501`.

## Linting

ESLint was added later as a development-only check. It reads the code and reports mistakes; it does not change, compile, or bundle anything, and the app runs perfectly well without it.

```bash
npm install     # once, to download ESLint
npm run lint    # check the code
```

The config is in `eslint.config.mjs`. It uses ESLint's recommended rules with browser globals, and only checks `app.js`.

One setting matters: `sourceType` is `"script"`, not `"module"`, because `app.js` is loaded with `<script src="app.js" defer>` and is a classic script rather than an ES module. If that tag ever changes, this has to change with it.

The VS Code ESLint extension shows the same warnings inline while you type.

## About the API key

The TMDB API key in `app.js` is visible in the code, so anyone can find it by viewing the page source. That's an acceptable tradeoff for a learning project with no backend — but not for a real product. In a production app, the key should live on a server instead, so the browser never sees it.

There's also no build step here, so there's nowhere to inject the key from an environment variable even if I wanted to. Hiding it properly would mean adding a server.

## Built with

- Plain HTML, CSS, and JavaScript — no frameworks, no bundler, no build step
- Chakra Petch and Inter fonts (Google Fonts)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- ESLint, for development only

## What's next

- A "Trending Movies" row, planned but not added yet
- A final responsiveness and cleanup pass
- No automated tests yet — everything is checked by hand in the browser

---

This product uses the TMDB API but is not endorsed or certified by TMDB.
