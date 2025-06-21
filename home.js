const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

function getEmbedPlayerURL(movieId, title, server = 'vidsrc') {
  if (server === 'vidsrc') {
    return `https://vidsrc.to/embed/movie/${movieId}`;
  } else if (server === 'apimocine') {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `https://apimocine.xyz/embed/${slug}`;
  }
  return '';
}

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
      const embedUrl = getEmbedPlayerURL(id, title);
      openPlayer(embedUrl, id, title);
    });
  });
}

function openPlayer(defaultUrl, movieId, title) {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-content" style="position: relative;">
      <span class="close-btn">×</span>

      <label style="color: white;">Change Server:</label>
      <select id="server-select" style="margin-bottom: 10px;">
        <option value="vidsrc">Vidsrc.to</option>
        <option value="apimocine">Apimocine</option>
      </select>

      <div class="iframe-shield"></div>
      <iframe id="player-frame" src="${defaultUrl}" width="100%" height="500" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
  `;

  document.body.appendChild(modal);

  const iframe = modal.querySelector('#player-frame');

  modal.querySelector('.close-btn').onclick = () => modal.remove();

  modal.querySelector('#server-select').onchange = (e) => {
    const selected = e.target.value;
    const newURL = getEmbedPlayerURL(movieId, title, selected);
    iframe.src = newURL;
  };

  // Remove iframe shield after 5 seconds to block accidental ad clicks
  setTimeout(() => {
    const shield = modal.querySelector('.iframe-shield');
    if (shield) shield.remove();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
