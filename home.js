const API_KEY = '77312bdd4669c80af3d08e0bf719d7ff';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

// Replace with your iframe player base URL
function getEmbedPlayerURL(movieId, title) {
  // VDSCR example
  return `https://vidsrc.to/embed/movie/${movieId}`;
  // or Apimocine (replace `title` with slug if needed)
  // return `https://apimocine.xyz/embed/${title}`;
}

async function fetchTrendingMovies() {
  const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
  const data = await res.json();
  displayMovies(data.results);
}

function displayMovies(movies) {
  const cardList = document.querySelector('.card-list');
  cardList.innerHTML = '';

  movies.forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${IMG_BASE + movie.poster_path}" alt="${movie.title}" />
      <div class="rating">${movie.vote_average.toFixed(1)}</div>
      <button class="watch-btn" data-id="${movie.id}" data-title="${movie.title}">▶ Watch</button>
    `;
    cardList.appendChild(card);
  });

  // Add click handlers for Watch buttons
  document.querySelectorAll('.watch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const embedUrl = getEmbedPlayerURL(id, title);
      openPlayer(embedUrl);
    });
  });
}

function openPlayer(url) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn">×</span>
      <iframe src="${url}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.close-btn').onclick = () => modal.remove();
}

document.addEventListener('DOMContentLoaded', fetchTrendingMovies);
