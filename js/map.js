import * as maplibregl from 'https://unpkg.com/maplibre-gl@6.16.0/dist/maplibre-gl.mjs';
import { CONFIG } from './config.js';

let map;
let destinationMarker;
let currentLocationMarker;
let latestPosition;
let movedToPlace = 0;

const ACCURACY_SOURCE_ID = 'kesana-location-accuracy';
const ACCURACY_LAYER_ID = 'kesana-location-accuracy-fill';
const ACCURACY_OUTLINE_ID = 'kesana-location-accuracy-outline';

function mapStyle() {
  const { provider, mapTilerApiKey, mapTilerStyle, openFreeMapStyle } = CONFIG.map;
  if (provider === 'maptiler' && mapTilerApiKey.trim()) {
    return `https://api.maptiler.com/maps/${encodeURIComponent(mapTilerStyle)}/style.json?key=${encodeURIComponent(mapTilerApiKey.trim())}`;
  }
  return openFreeMapStyle;
}

function markerElement(type) {
  const el = document.createElement('div');
  if (type === 'destination') {
    el.className = 'destination-icon-wrap';
    el.innerHTML = '<span class="destination-pin"><span class="destination-pin-core"></span></span>';
  } else {
    el.className = 'user-icon-wrap';
    el.innerHTML = '<span class="user-location-dot"></span>';
  }
  return el;
}

function popupContent(place) {
  const wrapper = document.createElement('div');
  wrapper.className = 'place-popup';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'place-popup-kicker';
  eyebrow.textContent = 'SELECTED PLACE';

  const name = document.createElement('strong');
  name.textContent = place.name;
  wrapper.append(eyebrow, name);

  if (place.secondary) {
    const subtitle = document.createElement('span');
    subtitle.textContent = place.secondary;
    wrapper.append(subtitle);
  }
  return wrapper;
}

/** Circle in WGS84 coordinates, for the browser geolocation accuracy estimate. */
function accuracyGeometry({ latitude, longitude, accuracy }) {
  const radius = Math.min(Math.max(Number(accuracy) || 25, 10), 15000);
  const latRadius = radius / 111320;
  const lonRadius = radius / (111320 * Math.max(0.05, Math.cos(latitude * Math.PI / 180)));
  const ring = [];
  for (let step = 0; step <= 64; step += 1) {
    const angle = 2 * Math.PI * step / 64;
    ring.push([
      longitude + lonRadius * Math.cos(angle),
      latitude + latRadius * Math.sin(angle)
    ]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
}

function updateAccuracyOverlay() {
  if (!map || !latestPosition || !map.isStyleLoaded()) return;
  const geojson = { type: 'FeatureCollection', features: [accuracyGeometry(latestPosition)] };
  const source = map.getSource(ACCURACY_SOURCE_ID);
  if (source) {
    source.setData(geojson);
    return;
  }
  map.addSource(ACCURACY_SOURCE_ID, { type: 'geojson', data: geojson });
  map.addLayer({
    id: ACCURACY_LAYER_ID,
    type: 'fill',
    source: ACCURACY_SOURCE_ID,
    paint: { 'fill-color': '#9dceb0', 'fill-opacity': 0.10 }
  });
  map.addLayer({
    id: ACCURACY_OUTLINE_ID,
    type: 'line',
    source: ACCURACY_SOURCE_ID,
    paint: { 'line-color': '#a6d5b5', 'line-width': 1.15, 'line-opacity': 0.42 }
  });
}

/** Overlay subtle 3D buildings only when the chosen vector style has building data. */
function addBuildingsIfSupported() {
  if (!CONFIG.map.enable3DBuildings || !map?.isStyleLoaded()) return;
  const style = map.getStyle();
  if (!style?.layers?.length || map.getLayer('kesana-buildings-3d')) return;

  // Respect styles that already draw their own extruded buildings.
  if (style.layers.some(layer => layer.type === 'fill-extrusion' && layer['source-layer'] === 'building')) return;
  const buildingLayer = style.layers.find(layer => layer['source-layer'] === 'building' && layer.source);
  const sourceId = buildingLayer?.source ||
    Object.keys(style.sources || {}).find(id => style.sources[id]?.type === 'vector');
  if (!sourceId) return;

  // Put buildings under symbol labels so roads and place names remain readable.
  const firstLabelId = style.layers.find(layer => layer.type === 'symbol')?.id;
  map.addLayer({
    id: 'kesana-buildings-3d',
    type: 'fill-extrusion',
    source: sourceId,
    'source-layer': 'building',
    minzoom: 15,
    paint: {
      'fill-extrusion-color': '#40594b',
      'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
      'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      'fill-extrusion-opacity': 0.61,
      'fill-extrusion-vertical-gradient': true
    }
  }, firstLabelId);
}

/** Initialize MapLibre with an actual dark vector basemap rather than filtered raster tiles. */
export function initMap(onError) {
  try {
    map = new maplibregl.Map({
    container: 'map',
    style: mapStyle(),
    center: [CONFIG.map.center[1], CONFIG.map.center[0]],
    zoom: CONFIG.map.zoom,
    minZoom: CONFIG.map.minZoom,
    maxZoom: CONFIG.map.maxZoom,
    pitch: CONFIG.map.pitch,
    maxPitch: CONFIG.map.maxPitch,
    bearing: 0,
    antialias: true,
    attributionControl: false,
    renderWorldCopies: false,
    locale: { 'AttributionControl.MapFeedback': 'Map feedback' }
    });
  } catch (error) {
    if (error instanceof maplibregl.GPUInitializationError) {
      throw new Error('This vector map needs WebGL2. Please use an up-to-date iPhone Safari browser.');
    }
    throw error;
  }

  map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-left');

  let didLoad = false;
  let reportedError = false;
  map.on('load', () => {
    didLoad = true;
    addBuildingsIfSupported();
    updateAccuracyOverlay();
  });
  map.on('error', event => {
    if (!didLoad && !reportedError && typeof onError === 'function') {
      reportedError = true;
      onError('Could not load the vector map. Check your connection and try refreshing.');
    }
    console.warn('KeSana map:', event.error?.message || event);
  });
  return map;
}

export function zoomIn() {
  map?.zoomIn({ duration: 350 });
}

export function zoomOut() {
  map?.zoomOut({ duration: 350 });
}

export function moveToPlace(place) {
  if (!map || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return;
  const position = [place.lon, place.lat];

  if (!destinationMarker) {
    destinationMarker = new maplibregl.Marker({
      element: markerElement('destination'),
      anchor: 'bottom'
    }).setLngLat(position).addTo(map);
  } else {
    destinationMarker.setLngLat(position);
  }

  const popup = new maplibregl.Popup({
    className: 'kesana-popup',
    closeButton: false,
    closeOnClick: false,
    offset: 36,
    maxWidth: '250px'
  }).setDOMContent(popupContent(place));

  destinationMarker.setPopup(popup);
  const ticket = ++movedToPlace;
  map.once('moveend', () => {
    if (ticket === movedToPlace && destinationMarker && !popup.isOpen()) {
      popup.addTo(map);
    }
  });
  map.flyTo({
    center: position,
    zoom: Math.max(map.getZoom(), 14.25),
    pitch: Math.max(map.getPitch(), 36),
    bearing: map.getBearing(),
    duration: 1050,
    essential: true
  });
}

export function showUserLocation({ latitude, longitude, accuracy }) {
  if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
  const position = [longitude, latitude];
  latestPosition = { latitude, longitude, accuracy };

  if (!currentLocationMarker) {
    currentLocationMarker = new maplibregl.Marker({
      element: markerElement('user'),
      anchor: 'center'
    }).setLngLat(position).addTo(map);
  } else {
    currentLocationMarker.setLngLat(position);
  }
  updateAccuracyOverlay();
  map.flyTo({
    center: position,
    zoom: Math.max(map.getZoom(), 15),
    pitch: map.getPitch(),
    duration: 900,
    essential: true
  });
}
