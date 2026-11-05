/** KeSana UI prototype settings. Switch providers here before public launch. */
export const CONFIG = Object.freeze({
  map: {
    center: [3.139, 101.6869], // Kuala Lumpur
    zoom: 12,
    minZoom: 5,
    maxZoom: 19,
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
  },
  search: {
    endpoint: 'https://photon.komoot.io/api/',
    limit: 5,
    countryCode: 'MY',
    minIntervalMs: 1200
  },
  places: {
    'kuala-lumpur': { name: 'Kuala Lumpur', secondary: 'Wilayah Persekutuan', lat: 3.139, lon: 101.6869 },
    'george-town': { name: 'George Town', secondary: 'Pulau Pinang', lat: 5.4141, lon: 100.3288 },
    'kota-kinabalu': { name: 'Kota Kinabalu', secondary: 'Sabah', lat: 5.9804, lon: 116.0735 }
  }
});
