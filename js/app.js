import { CONFIG } from './config.js';
import { initMap, moveToPlace, showUserLocation, zoomIn, zoomOut } from './map.js';
import { searchPlaces } from './search.js';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const clearButton = document.getElementById('clear-search');
const quickPlaces = document.getElementById('quick-places');
const searchResults = document.getElementById('search-results');
const resultsLabel = document.getElementById('results-label');
const resultsCount = document.getElementById('results-count');
const resultsList = document.getElementById('results-list');
const locateButton = document.getElementById('locate-btn');
const toastElement = document.getElementById('toast');
let lastSearchAt = 0;
let activeRequest;
let toastTimeout;

try {
  initMap();
} catch (error) {
  showToast(error.message);
}

function showToast(message, timeout = 3500) {
  toastElement.textContent = message;
  toastElement.hidden = false;
  toastElement.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toastElement.classList.remove('visible');
    window.setTimeout(() => { toastElement.hidden = true; }, 220);
  }, timeout);
}

function setSearchContent(visible) {
  searchResults.hidden = !visible;
  quickPlaces.hidden = visible;
}

function updateClearButton() {
  clearButton.hidden = input.value.length === 0;
}

function selectPlace(place) {
  if (activeRequest) activeRequest.abort();
  moveToPlace(place);
  input.value = place.name;
  updateClearButton();
  setSearchContent(false);
  input.blur();
  showToast(`Showing ${place.name} on the map`, 2500);
}

function renderResults(items) {
  resultsList.replaceChildren();
  resultsLabel.textContent = 'SEARCH RESULTS';
  resultsCount.textContent = `${items.length} FOUND`;
  setSearchContent(true);

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'results-empty';
    empty.textContent = 'No matching places found in Malaysia. Try a nearby town or landmark.';
    resultsList.append(empty);
    return;
  }

  for (const place of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'result-item';
    button.setAttribute('role', 'listitem');
    button.innerHTML = '<span class="result-icon" aria-hidden="true">⌁</span><span class="result-copy"><strong></strong><small></small></span><span class="result-arrow" aria-hidden="true">↗</span>';
    button.querySelector('strong').textContent = place.name;
    button.querySelector('small').textContent = place.secondary || 'Malaysia';
    button.addEventListener('click', () => selectPlace(place));
    resultsList.append(button);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (query.length < 2) {
    showToast('Enter at least 2 characters to search.');
    input.focus();
    return;
  }
  const now = Date.now();
  if (now - lastSearchAt < CONFIG.search.minIntervalMs) {
    showToast('Please wait a moment before searching again.');
    return;
  }
  lastSearchAt = now;
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  input.blur();
  searchResults.hidden = false;
  quickPlaces.hidden = true;
  resultsLabel.textContent = 'SEARCHING MALAYSIA';
  resultsCount.textContent = '';
  resultsList.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'results-empty loading-message';
  loading.textContent = 'Finding places…';
  resultsList.append(loading);
  try {
    const places = await searchPlaces(query, controller.signal);
    if (activeRequest === controller) renderResults(places);
  } catch (error) {
    if (error.name === 'AbortError') return;
    if (activeRequest !== controller) return;
    setSearchContent(false);
    showToast(error.message || 'Search failed. Check your internet connection.');
  } finally {
    if (activeRequest === controller) activeRequest = null;
  }
});

input.addEventListener('input', () => {
  updateClearButton();
  if (!input.value.trim()) {
    activeRequest?.abort();
    setSearchContent(false);
  }
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    input.blur();
    setSearchContent(false);
  }
});

clearButton.addEventListener('click', () => {
  activeRequest?.abort();
  input.value = '';
  updateClearButton();
  setSearchContent(false);
  input.focus();
});

document.querySelectorAll('[data-place]').forEach((button) => {
  button.addEventListener('click', () => {
    const place = CONFIG.places[button.dataset.place];
    if (place) selectPlace(place);
  });
});

document.getElementById('zoom-in').addEventListener('click', zoomIn);
document.getElementById('zoom-out').addEventListener('click', zoomOut);

locateButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('Location is unavailable in this browser.');
    return;
  }
  locateButton.classList.add('locating');
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locateButton.classList.remove('locating');
      showUserLocation(position.coords);
      showToast('You are here', 2200);
    },
    (error) => {
      locateButton.classList.remove('locating');
      showToast(error.code === 1 ? 'Allow location access in Safari settings to use this button.' : 'Could not find your location. Try again.');
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
  );
});

// Mobile keyboard: keep the floating panel above the iOS visual viewport.
// Guard against keyboard offset being applied twice on browsers that resize layout viewport.
function syncVisualViewport() {
  const viewport = window.visualViewport;
  if (!viewport) return;
  const hiddenHeight = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
  const keyboardHeight = hiddenHeight > 140 ? hiddenHeight : 0;
  document.documentElement.style.setProperty('--keyboard-offset', `${keyboardHeight}px`);
  document.documentElement.classList.toggle('keyboard-open', keyboardHeight > 0);
}
window.visualViewport?.addEventListener('resize', syncVisualViewport);
window.visualViewport?.addEventListener('scroll', syncVisualViewport);
window.addEventListener('resize', syncVisualViewport);
syncVisualViewport();
