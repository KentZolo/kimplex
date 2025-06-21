const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentItem = null;

function fetchData(endpoint, callback) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  fetch(url)
    .then(response => response.json())
    .then(data => callback(data.results))
    .catch(error => console.error('Error:', error));
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'poster-wrapper';

    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => showDetails(item);

    const label = document.createElement('div');
    label.className = 'poster-label';
    label.textContent = item.title || item.name;

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

function showDetails(item) {
  item.media_type = item.media_type || (item.title ? "movie" : "tv");
  currentItem = item;

  const type = item.media_type;
  const url = `?type=${type}&id=${item.id}`;
  window.history.pushState({}, '', url);

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

  iframe.onerror = () => {
    alert("⚠️ This movie is not available on this server. Try another.");
  };
}

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

  const url = new URL(`${BASE_URL}/search/multi`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('query', query);

  fetch(url)
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

// Load content
fetchData('/movie/now_playing', data => {
  const updated = data.map(item => ({ ...item, media_type: 'movie' }));
  displayList(updated, 'now-playing');
});
fetchData('/trending/movie/day', data => displayList(data, 'trending-movies'));
fetchData('/trending/tv/day', data => displayList(data, 'trending-tv'));
fetchData('/movie/popular', data => displayList(data, 'popular-movies'));
fetchData('/tv/popular', data => displayList(data, 'popular-series'));

// ✅ Featured Carousel with arrows and caption
const featuredUrl = new URL(`${BASE_URL}/movie/now_playing`);
featuredUrl.searchParams.set('api_key', API_KEY);

fetch(featuredUrl)
  .then(res => res.json())
  .then(data => {
    const featuredList = document.getElementById('featured-list');
    data.results.slice(0, 5).forEach(movie => {
      const li = document.createElement('li');
      li.className = 'splide__slide';
      li.innerHTML = `
        <img src="${IMG_URL}${movie.backdrop_path || movie.poster_path}" alt="${movie.title}">
        <div class="caption">${movie.title}</div>
      `;
      li.onclick = () => showDetails({ ...movie, media_type: "movie" });
      featuredList.appendChild(li);
    });

    new Splide('#featured-carousel', {
      type: 'loop',
      perPage: 1,
      autoplay: true,
      arrows: true,
      pagination: false,
    }).mount();
  })
  .catch(err => console.error("Failed to load featured movies:", err));

// Auto-open modal from URL if present
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const type = params.get("type");

  if (id && type) {
    const url = new URL(`${BASE_URL}/${type}/${id}`);
    url.searchParams.set('api_key', API_KEY);

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success === false || data.status_code === 34) {
          alert("❌ Movie or TV show not found.");
          return;
        }
        data.media_type = type;
        showDetails(data);
      })
      .catch(err => {
        alert("⚠️ Something went wrong.");
        console.error("Auto-load error:", err);
      });
  }
});
