const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentItem = null;

function showDetails(item) {
  currentItem = item;
  item.media_type = item.media_type || 'movie';
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  document.getElementById('modal').style.display = 'flex';

  const type = item.media_type;
  const iframe = document.getElementById('modal-video');
  iframe.src = `https://apimocine.vercel.app/${type}/${item.id}?autoplay=true`;
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function fetchFeaturedMovies() {
  const url = new URL(`${BASE_URL}/movie/now_playing`);
  url.searchParams.set('api_key', API_KEY);

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('featured-list');
      data.results.slice(0, 5).forEach(movie => {
        const li = document.createElement('li');
        li.className = 'splide__slide';
        li.innerHTML = `
          <img src="${IMG_URL}${movie.backdrop_path || movie.poster_path}" alt="${movie.title}">
          <div class="caption">${movie.title}</div>
        `;
        li.onclick = () => showDetails({ ...movie, media_type: 'movie' });
        list.appendChild(li);
      });

      new Splide('#featured-carousel', {
        type: 'loop',
        perPage: 1,
        autoplay: true,
        arrows: true,
        pagination: false,
      }).mount();
    });
}

// Init
fetchFeaturedMovies();
