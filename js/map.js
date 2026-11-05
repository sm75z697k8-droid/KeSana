import { CONFIG } from './config.js';

let map;
let destinationMarker;
let currentLocationMarker;
let accuracyCircle;

function destinationIcon() {
  return L.divIcon({
    className: 'destination-icon-wrap',
    html: '<span class="destination-pin"><span class="destination-pin-core"></span></span>',
    iconSize: [38, 46],
    iconAnchor: [19, 42],
    popupAnchor: [0, -41]
  });
}

function userIcon() {
  return L.divIcon({
    className: 'user-icon-wrap',
    html: '<span class="user-location-dot"></span>',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

export function initMap() {
  if (typeof L === 'undefined') {
    throw new Error('Map library failed to load. Check your internet connection.');
  }
  map = L.map('map', {
    zoomControl: false,
    attributionControl: true,
    preferCanvas: true,
    zoomSnap: 0.25,
    zoomDelta: 0.75,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    tap: false
  }).setView(CONFIG.map.center, CONFIG.map.zoom);

  L.tileLayer(CONFIG.map.tileUrl, {
    maxZoom: CONFIG.map.maxZoom,
    maxNativeZoom: 19,
    attribution: CONFIG.map.attribution,
    updateWhenIdle: true,
    keepBuffer: 2
  }).addTo(map);

  return map;
}

export function zoomIn() {
  map?.zoomIn();
}

export function zoomOut() {
  map?.zoomOut();
}

export function moveToPlace(place) {
  if (!map || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return;
  const position = [place.lat, place.lon];

  if (!destinationMarker) {
    destinationMarker = L.marker(position, {
      icon: destinationIcon(),
      keyboard: false
    }).addTo(map);
  } else {
    destinationMarker.setLatLng(position);
  }

  destinationMarker.bindPopup(
    `<div class="place-popup"><span class="place-popup-kicker">SELECTED PLACE</span><strong>${escapeHTML(place.name)}</strong>${place.secondary ? `<span>${escapeHTML(place.secondary)}</span>` : ''}</div>`,
    { autoPan: false, closeButton: false, offset: [0, -2], className: 'kesana-popup' }
  );

  map.flyTo(position, Math.max(map.getZoom(), 13.5), { animate: true, duration: 1.05 });
  setTimeout(() => destinationMarker?.openPopup(), 1150);
}

export function showUserLocation({ latitude, longitude, accuracy }) {
  if (!map) return;
  const position = [latitude, longitude];
  if (!currentLocationMarker) {
    currentLocationMarker = L.marker(position, { icon: userIcon(), keyboard: false, zIndexOffset: 1000 }).addTo(map);
  } else {
    currentLocationMarker.setLatLng(position);
  }
  if (!accuracyCircle) {
    accuracyCircle = L.circle(position, { radius: accuracy || 25, color: '#a9dfb7', weight: 1, fillColor: '#a9dfb7', fillOpacity: 0.1, opacity: 0.3, interactive: false }).addTo(map);
  } else {
    accuracyCircle.setLatLng(position).setRadius(accuracy || 25);
  }
  map.flyTo(position, Math.max(map.getZoom(), 15), { animate: true, duration: 0.9 });
}

/** Escape text before inserting it in Leaflet's popup HTML. */
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
