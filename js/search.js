import { CONFIG } from './config.js';

/** Prototype-only Malaysian place lookup via Photon public demo server.
 * No background autocomplete: only a deliberate form submission sends a request.
 * Replace the demo provider with a dedicated service before a large release.
 */
export async function searchPlaces(query, signal) {
  const url = new URL(CONFIG.search.endpoint);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(CONFIG.search.limit));
  url.searchParams.set('countrycode', CONFIG.search.countryCode);
  url.searchParams.set('lang', 'en');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(response.status === 429 ? 'Search is busy. Try again in a moment.' : 'Could not search places right now.');
  }
  const body = await response.json();
  if (!Array.isArray(body.features)) return [];

  return body.features
    .filter((item) => item.geometry?.type === 'Point' && item.properties?.countrycode?.toUpperCase() === 'MY')
    .map((item) => {
      const [lon, lat] = item.geometry.coordinates || [];
      const p = item.properties;
      return {
        id: `${p.osm_type || 'place'}-${p.osm_id || `${lat}-${lon}`}`,
        name: p.name || p.street || p.city || 'Unnamed place',
        secondary: [...new Set([p.street, p.city, p.state].filter((x) => x && x !== p.name))].join(', '),
        lat: Number(lat),
        lon: Number(lon)
      };
    })
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon));
}
