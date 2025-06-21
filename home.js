const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const SERVERS = [
  { name: 'Vidsrc.to', id: 'vidsrc', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
  { name: 'Apimocine', id: 'apimocine', url: (title) => `https://apimocine.xyz/embed/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
];

async function fetchTrendingMovies() {
  const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
  const data = await res.json();
  displayMovies(data.results);
}

function displayMovies(movies) {
  const cardList = document.querySelector('.movie-list');
  cardList.innerHTML = '';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('poster-wrapper');
    card.innerHTML = `
      <img src="${IMG_BASE + movie.poster_path}" alt="${movie.title}" />
      <div class="poster-label">${movie.title}</div>
      <button class="watch-btn" data-id="${movie.id}" data-title="${movie.title}">▶ Watch</button>
    `;
    cardList.appendChild(card);
  });

  document.querySelectorAll('.watch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      openPlayer(id, title);
    });
  });
}

function openPlayer(movieId, title) {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-content" style="position: relative;">
      <span class="close-btn">×</span>

      <label style="color: white;">Change Server:</label>
      <select id="server-select" style="margin-bottom: 10px;"></select>

      <div class="iframe-shield"></div>
      <iframe id="player-frame" width="100%" height="500" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin"></iframe>
      <p style="color: #aaa; font-size: 12px; text-align: center;">This content is hosted by a third-party. We do not control the ads shown in the player.</p>
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

  let currentServerIndex = 0;

  function loadServer(index) {
    const server = SERVERS[index];
    select.value = server.id;
    const embedURL = server.id === 'vidsrc' ? server.url(movieId) : server.url(title);
    iframe.src = embedURL;

    // Reset iframe shield
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

  loadServer(currentServerIndex);

  modal.querySelector('.close-btn').onclick = () => modal.remove();

  select.onchange = () => {
    const selectedIndex = SERVERS.findIndex(s => s.id === select.value);
    if (selectedIndex !== -1) {
      loadServer(selectedIndex);
    }
  };
}

document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
