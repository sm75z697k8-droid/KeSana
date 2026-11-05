# KeSana — Malaysia Dark Vector Map (Version 1.1)

A mobile-first navigation UI prototype focused on Malaysia. This upgrade replaces
filtered raster tiles with a **real dark vector map rendered by MapLibre GL JS**.
It is designed for iPhone Safari and hosted with GitHub Pages.

## Included
- Beautiful dark vector map with smooth pan, zoom, rotate and pitch
- Subtle 3D building extrusions in areas where building data is available
- Charcoal-black UI, muted neon-green controls and custom place pins
- Floating bottom search dock with Malaysia-focused destination lookup
- Kuala Lumpur, George Town and Kota Kinabalu shortcuts
- Optional iPhone geolocation marker and accuracy circle
- iOS Safari safe-area and keyboard layout handling
- No build tools, payment details, MapTiler account or API keys required by default

**This is a UI prototype, not turn-by-turn navigation yet.** Routing, road
matching, traffic, toll prices, voice guidance and ETA aren't implemented.

## Map provider — free by default

The default style is **OpenFreeMap Dark**:
`https://tiles.openfreemap.org/styles/dark`

OpenFreeMap provides vector tiles without a key. Data is derived from OpenStreetMap,
and provider attribution is displayed on the map. The public service does not
promise an uptime SLA. Service terms: https://openfreemap.org/

To optionally use **MapTiler Streets Dark**, open `js/config.js` and change:

```js
provider: 'maptiler',
mapTilerStyle: 'streets-v4-dark',
mapTilerApiKey: 'YOUR_MAPTILER_PUBLIC_API_KEY'
```

Create your key at https://cloud.maptiler.com/ and **restrict it to your
GitHub Pages origin**. Keys inside static browser files are visible to site
visitors, so never use a secret/private credential here. If no MapTiler key
is entered, KeSana automatically uses OpenFreeMap.

## Repository files

```text
KeSana/
├── index.html           # iPhone app layout and markup
├── css/styles.css       # Dark green UI and MapLibre controls
├── js/config.js         # Provider selection, zoom, places and search options
├── js/map.js            # MapLibre rendering, location, markers and 3D
├── js/search.js         # Malaysia place lookup using Photon demo server
├── js/app.js            # Search, buttons and keyboard interactions
├── assets/favicon.svg
├── .nojekyll
└── README.md
```

## Publish using only an iPhone

1. Open [Settings → Pages](https://github.com/sm75z697k8-droid/KeSana/settings/pages).
2. In **Build and deployment**, select **Deploy from a branch**.
3. Choose **main**, **/(root)**, then **Save**.
4. After the deployment succeeds, open:
   https://sm75z697k8-droid.github.io/KeSana/

The first load requires internet access. The UI uses the MapLibre GL JS v6.16.0
ES module and stylesheet from UNPKG and requires WebGL2. An up-to-date
Safari/iOS browser is recommended.

## Usage and service limitations

- Keep visible OpenFreeMap, OpenMapTiles and OpenStreetMap attributions.
- Dark style and free map tiles come from OpenFreeMap; OpenFreeMap has no SLA.
- Geocoding uses the public Photon demo endpoint only on explicit Search
  submissions, subject to rate limits and without production guarantees.
- Geolocation requires a secure HTTPS origin and user permission.
- No offline navigation or background location recording is implemented.
- 3D building detail depends on the available local vector data.
- For large-scale use, select a production map/geocoding provider and verify
  quotas, commercial terms, coverage and reliability.

## Next improvements

Suggested next steps: map camera polish, route preview, Malaysia road routing,
ETA, real-time traffic, lane guidance and voice navigation.
