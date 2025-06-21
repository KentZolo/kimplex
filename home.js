const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const SERVERS = [
  {
    name: 'Server 1',
    id: 'vidsrccc',
    url: (type, id) => `https://vidsrc.cc/v2/embed/${type}/${id}`
  },
  {
    name: 'Server 2',
  id: 'apimocine',
  url: (type, id) => `https://apimocine.vercel.app/${type}/${id}?autoplay=true`
  }
];

async function fetchAndDisplay(endpoint, containerSelector, type) {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
  const data = await res.json();
  displayMedia(data.results, containerSelector, type);
}

function displayMedia(items, containerSelector, defaultType) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';

  items.forEach(item => {
    const id = item.id;
    const title = item.title || item.name;
    const poster = item.poster_path ? IMG_BASE + item.poster_path : '';
    const mediaType = item.media_type || defaultType;

    const card = document.createElement('div');
    card.classList.add('swiper-slide', 'poster-wrapper');
    card.innerHTML = `
      <img src="${poster}" alt="${title}" />
      <div class="poster-label">${title}</div>
      <button class="watch-btn" data-id="${id}" data-title="${title}" data-type="${mediaType}">▶ Watch</button>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll('.watch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const type = btn.getAttribute('data-type');
      openPlayer(id, title, type);
    });
  });
}

function openPlayer(itemId, title, mediaType) {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-content" style="position: relative;">
      <span class="close-btn">×</span>
      <label style="color: white;">Change Server:</label>
      <select id="server-select" style="margin-bottom: 10px;"></select>
      <div class="iframe-shield"></div>
      <iframe id="player-frame" width="100%" height="500" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin"></iframe>
      <p style="color: #aaa; font-size: 12px; text-align: center;">This video is hosted by a third-party. Ads may appear inside the player.</p>
    </div>
  `;

  document.body.appendChild(modal);
  const iframe = modal.querySelector('#player-frame');
  const select = modal.querySelector('#server-select');

  SERVERS.forEach(server => {
    const option = document.createElement('option');
    option.value = server.id;
    option.textContent = server.name;
    select.appendChild(option);
  });

  function loadServer(index) {
    const server = SERVERS[index];
    select.value = server.id;
    const embedURL = server.id === 'apimocine'
      ? server.url(mediaType, title)
      : server.url(mediaType, itemId);
    iframe.src = embedURL;

    const shield = modal.querySelector('.iframe-shield');
    shield.style.display = 'block';
    setTimeout(() => shield.remove(), 5000);

    iframe.onerror = () => {
      if (index + 1 < SERVERS.length) {
        loadServer(index + 1);
      } else {
        alert('⚠️ No working server found.');
      }
    };
  }

  loadServer(0);

  modal.querySelector('.close-btn').onclick = () => modal.remove();

  select.onchange = () => {
    const selectedIndex = SERVERS.findIndex(s => s.id === select.value);
    if (selectedIndex !== -1) loadServer(selectedIndex);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplay('/trending/all/day', '.movie-list', 'movie');
  fetchAndDisplay('/movie/popular', '.popular-list', 'movie');
  fetchAndDisplay('/tv/popular', '.tv-list', 'tv');
});
