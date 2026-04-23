const searchButton = document.querySelector('.js-search-button');

const cityInput = document.querySelector('.js-city-input');

const weatherResult = document.querySelector('.js-weather-result')

const historyList = document.querySelector('.js-history-list');

const clearHistoryButton = document.querySelector('.js-clear-history')
 

  function getWeatherInfo(code) {
  const weatherMap = {
    0: { text: 'Clear sky', icon: '☀️' },
    1: { text: 'Mainly clear', icon: '🌤️' },
    2: { text: 'Partly cloudy', icon: '⛅' },
    3: { text: 'Overcast', icon: '☁️' },
    61: { text: 'Rain', icon: '🌧️' },
    63: { text: 'Moderate rain', icon: '🌧️' },
    65: { text: 'Heavy rain', icon: '⛈️' }
  };

  return weatherMap[code] || { text: 'Unknown', icon: '❓' };
}

function updateBackground(code) {
  if (code === 0) {
    document.body.className = 'sunny';
  } else if (code <= 3) {
    document.body.className = 'cloudy';
  } else if (code >= 61) {
    document.body.className = 'rainy';
  } else {
    document.body.className = ''; 
  }
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

  let historyHTML = '';

  history.forEach((city) => {
    historyHTML += `
      <button class="history-button" data-city="${city}">
        ${city}
      </button>
    `;
  });

  historyList.innerHTML = historyHTML;

  document.querySelectorAll('.history-button')
    .forEach((button) => {
      button.addEventListener('click', () => {
        const city = button.dataset.city;
        getWeather(city);
      });
    });

    clearHistoryButton.style.display = history.length
      ? 'inline-block'
      : 'none';
}

  async function getWeather(city) {
  if (!city) {
  weatherResult.innerHTML = 'Please enter a city name';
  return;
  }

  weatherResult.innerHTML = `
   <div class="loading-state">
    Fetching weather...
    </div>
    `;

   try {
  //step 1: Get coordinates from city name
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
  );

  const geoData = await geoResponse.json()

  if(!geoData.results || geoData.results.length === 0) {
    weatherResult.innerHTML = 'City not found';
    return;
  }

  const { latitude, longitude, name, country, admin1 } = geoData.results[0];


  //step 2: Get weather using coordinates
   const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  const weatherData = await weatherResponse.json();

  const temperature = weatherData.current_weather.temperature;
  const windspeed = weatherData.current_weather.windspeed;
  const weatherCode = weatherData.current_weather.weathercode;
  const weatherInfo = getWeatherInfo(weatherCode);
  updateBackground(weatherCode)

  //Display result
  weatherResult.innerHTML = `
    <div class="weather-card">
    <h3>${name}${admin1 ? `, ${admin1}` : ''}, ${country}</h3>
    <div class="weather-icon">${weatherInfo.icon}</div>
    <p class="weather-temp">${temperature}°C</p>
    <p>${weatherInfo.text}</p>
    <p>💨 Wind: ${windspeed} km/h</p>
    </div>
    `;

   cityInput.value = '';

   let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
      if (!history.includes(city)) {
        history.unshift(city);
      }

      history = history.slice(0, 5);

      localStorage.setItem('searchHistory', JSON.stringify(history));

      renderHistory();

      localStorage.setItem('lastCity', JSON.stringify(city));
  } catch(error) {
    weatherResult.innerHTML = 'Something went wrong.';
  }

 };
  renderHistory();

  searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();


    getWeather(city);
  })

  cityInput.addEventListener('keydown', (event) => {
    const city = cityInput.value.trim();

    if(event.key === 'Enter') {
      getWeather(city)
    }
   
  })

   clearHistoryButton.addEventListener('click', () => {
    localStorage.removeItem('searchHistory');

    renderHistory()
   })

  window.addEventListener('DOMContentLoaded', () => {
  const savedCity = JSON.parse(localStorage.getItem('lastCity'));

  if (savedCity) {
    getWeather(savedCity);
  }

  renderHistory();
});


 