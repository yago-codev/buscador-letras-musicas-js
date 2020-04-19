const form = document.querySelector('#form');
const searchInput = document.querySelector('#search');
const songsContainer = document.querySelector('#songs-container');
const prevAndNextContainer = document.querySelector('#prev-and-next-container');

const baseURL = 'https://api.lyrics.ovh';

const fetchData = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const getMoreSongs = async (url) => {
  // abaixo iremos utilizar o "cors-anywhere" que irá fazer a configuração do CORS automaticamente
  const data = await fetchData(`https://cors-anywhere.herokuapp.com/${url}`);

  insertSongsIntoPage(data);
};

const insertNextAndPrevButtons = ({ prev, next }) => {
  prevAndNextContainer.innerHTML = `
  ${prev ? `<button class="btn" onClick="getMoreSongs('${prev}')">Anteriores</button>` : ''}
  ${next ? `<button class="btn" onClick="getMoreSongs('${next}')">Próximas</button>` : ''}
`;
};

const insertSongsIntoPage = ({ data, prev, next }) => {
  // a função join irá retornar uma nova string contendo todos os ítens do
  // array concatenados e separados por vírgula.
  // a funçao join recebe um parâmetro opcional, que será utilizado como separador.
  // ou seja, ela irá separar os elementos da string retornada através desse parâmetro especificado.
  // passaremos um espaço vazio como parâmetro para
  // podermos obter todas as <li> corretamente separadas.
  songsContainer.innerHTML = data.map(({ artist: { name }, title }) => `
    <li class="song">
      <span class="song-artist">
        <strong>${name}</strong> - ${title}
      </span>
      <button class="btn" data-artist="${name}" data-song-title="${title}">
        Ver letra
      </button>
    </li>
  `).join();

  // verificando se existem páginas anteriores ou posteriores a página atual
  if (prev || next) {
    insertNextAndPrevButtons({ prev, next });
    return;
  }

  prevAndNextContainer.innerHTML = '';
};

const fetchSongs = async (term) => {
  // PROMISES
  // fetch(`${baseURL}/suggest/${term}`)
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log(data);
  //   });

  // ASYNC/AWAIT
  const data = await fetchData(`${baseURL}/suggest/${term}`);

  insertSongsIntoPage(data);
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  // a função trim() remove os espaços em branco no início e no final das strings
  const searchTerm = searchInput.value.trim();

  // limpando o input
  searchInput.value = '';

  // focando o cursor no input
  searchInput.focus();

  // validação para não deixar o usuário enviar o form vazio e
  // exibir uma mensagem de erro abaixo do input
  if (!searchTerm) {
    songsContainer.innerHTML = '<li class=\'warning-message\'>Por favor, digite um termo válido</li>';
    return;
  }

  fetchSongs(searchTerm);
};

form.addEventListener('submit', handleFormSubmit);

const refreshPage = () => {
  window.location.reload();
};

const insertLyricsIntoPage = ({ songTitle, artist, lyrics }) => {
  songsContainer.innerHTML = `
    <li class="lyrics-container">
      <h2>
        <strong>${songTitle}</strong> - ${artist}
      </h2>
      <p class="lyrics">
        ${lyrics}
      </p>
    </li>
  `;

  prevAndNextContainer.innerHTML = `
    <button class="btn" onClick="refreshPage()">
        Voltar
    </button>
  `;
};

const fetchLyrics = async (artist, songTitle) => {
  const data = await fetchData(`${baseURL}/v1/${artist}/${songTitle}`);

  // abaixo utilizaremos a função replace() para formatarmos a letra da música.
  // no momento a letra da música está sem quebras de linha,
  // portando utilizaremos uma REGEX para capturar todas as incidências de
  // marcações que indiquem quebras de linha,
  // posteriormente utilizaremos a tag <br> para quebrarmos as linhas
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

  insertLyricsIntoPage({ lyrics, artist, songTitle });
};

const handleSongsContainerClick = (e) => {
  const clickedElement = e.target;

  if (clickedElement.tagName === 'BUTTON') {
    const artist = clickedElement.getAttribute('data-artist');
    const songTitle = clickedElement.getAttribute('data-song-title');

    // não iremos exibir os botões de paginação quando exibirmos a letra da música
    prevAndNextContainer.innerHTML = '';

    fetchLyrics(artist, songTitle);
  }
};

songsContainer.addEventListener('click', handleSongsContainerClick);
