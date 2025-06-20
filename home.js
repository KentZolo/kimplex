const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff'; // ← PALITAN ITO NG TMDB KEY MO
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentItem = null;

function fetchData(endpoint, callback) {
  fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(data => callback(data.results))
    .catch(error => console.error('Error:', error));
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "apimocine") {
    embedURL = `https://apimocine.vercel.app/${type}/${currentItem.id}?autoplay=true`;
  } else if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  const iframe = document.getElementById('modal-video');
  iframe.src = embedURL;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');

  // Optional error handling
  iframe.onerror = () => {
    alert("⚠️ This movie is not available on this server. Try another.");
  };
}

// 🔍 SEARCH FEATURE
function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
}

function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const resultsContainer = document.getElementById('search-results');

  if (query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }

  fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      resultsContainer.innerHTML = '';
      data.results.forEach(item => {
        if (!item.poster_path) return;
        const img = document.createElement('img');
        img.src = `${IMG_URL}${item.poster_path}`;
        img.alt = item.title || item.name;
        img.style.width = '120px';
        img.style.margin = '5px';
        img.style.cursor = 'pointer';
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        resultsContainer.appendChild(img);
      });
    })
    .catch(error => console.error('Search error:', error));
}

// 🔄 LOAD SECTIONS
fetchData('/trending/all/day', data => displayList(data, 'trending'));
fetchData('/movie/top_rated', data => displayList(data, 'top-rated'));
fetchData('/movie/popular', data => displayList(data, 'popular'));
fetchData('/tv/popular', data => displayList(data, 'popular-series'));
