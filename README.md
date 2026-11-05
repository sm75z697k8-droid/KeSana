# KeSana — Malaysia Navigation UI (v1)

A clean, touch-friendly **dark map web app** with restrained neon-green accents, designed primarily for iPhone Safari and prepared for GitHub Pages.

## What's inside

- Full-viewport interactive map of Malaysia with touch pinch, drag and zoom
- Dark map styling, soft mint-green branding and floating controls
- Rounded floating destination search panel at the bottom
- Malaysian place search using the [Photon](https://github.com/komoot/photon) demo geocoding API **only on Enter/Search** (no autocomplete requests)
- Selectable search results with a precisely anchored map marker
- Quick jump shortcuts to Kuala Lumpur, George Town and Kota Kinabalu
- Optional current-location button (browser permission required)
- Responsive sizing, iPhone safe areas and keyboard-aware search panel

**Scope:** This is a UI-and-search prototype. There is **no navigation engine, route calculation, live traffic or voice guidance** yet.

## Project structure

```text
KeSana-Neon-UI/
├── index.html       # Layout and controls (GitHub Pages entry)
├── css/
│   └── styles.css   # Theme, map styles and responsive layout
├── js/
│   ├── config.js    # Provider endpoints and Malaysian shortcuts
│   ├── map.js       # Leaflet map, markers and location
│   ├── search.js    # Photon geocoding (Malaysia only)
│   └── app.js       # UI interactions and event handling
├── assets/
│   └── favicon.svg  # Brand icon
├── .nojekyll        # Serve files as-is via GitHub Pages
└── README.md
```

## Publish with GitHub Pages (no computer required)

1. Open [Settings → Pages](https://github.com/sm75z697k8-droid/KeSana/settings/pages).
2. Select **Deploy from a branch**, then **main** and **/(root)**, and save.
3. Once GitHub publishes, open `https://sm75z697k8-droid.github.io/KeSana/`.

No `npm install`, build step, paid map key or laptop is required. A network connection is required for the map library, map tiles and location searches.

The GitHub repository uses the organized, separated-file version.

## External services and limitations

- Map rendering: [Leaflet 1.9.4](https://leafletjs.com/) via jsDelivr.
- Tiles: public [OpenStreetMap tile server](https://operations.osmfoundation.org/policies/tiles/), styled dark through CSS. Keep the map's visible attribution. OSM public tiles are for modest interactive use, not bulk download or large-scale production. The map currently has a dark *filter* rather than custom vector styling.
- Search: public [Photon demo API](https://github.com/komoot/photon), used only when the user submits a search. It's allowed for reasonable small projects but may throttle requests and comes without guaranteed uptime. A production app should use a dedicated or self-hosted geocoder.
- No offline map downloading or tile prefetching is implemented.
- Device location on GitHub Pages works over HTTPS and only after permission is granted.
- Search requests are sent to Photon and map tiles to OpenStreetMap; avoid using sensitive personal information as a search query.

## Customize

- Change accent and panel colors at the top of `css/styles.css`.
- Adjust initial coordinates, map tile service, geocoder or Malaysian shortcuts in `js/config.js`.
- Add routing later as a separate module, without changing the existing UI structure.

Built as an independent UI prototype; it does not modify the previous KeSana repository.