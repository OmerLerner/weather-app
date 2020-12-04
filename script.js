if (!sessionStorage.getItem('celsiusChosen')) {
  sessionStorage.setItem('celsiusChosen', true);
}
let celsiusChosen = sessionStorage.getItem('celsiusChosen');

let errorMSG = document.getElementById('errorMSG');

const weatherSearchButton = document.querySelector('#weatherSubmitButton');

const weatherContainer = document.getElementById('basicWeatherContainer');

const displayMoreWeatherButton = document.querySelector('#arrowElement');

const degreeSwitchButton = document.querySelector('.toggle-button-cover');

let expandContentButtonPressed = false;

let parsedWeatherData;

function processData(weatherData) {
  const currentTemperatureC = weatherData.current.temp_c;
  const currentFeelsLikeC = weatherData.current.feelslike_c;
  const currentTemperatureF = weatherData.current.temp_f;
  const currentFeelsLikeF = weatherData.current.feelslike_f;
  const currentWeatherCondition = weatherData.current.condition;
  const currentWindC = weatherData.current.wind_kph;
  const currentWindF = weatherData.current.wind_mph;
  const currentHumidity = weatherData.current.humidity;
  const { sunrise } = weatherData.forecast.forecastday[0].astro;
  const { sunset } = weatherData.forecast.forecastday[0].astro;
  const dailyForecast = weatherData.forecast.forecastday[0].day;
  const cityName = weatherData.location.name;
  let cityCountry = weatherData.location.country;
  const cityRegion = weatherData.location.region;
  if (weatherData.location.country === 'United States of America') cityCountry = cityRegion;
  return {
    cityDetails: { name: cityName, country: cityCountry, region: cityRegion },
    forecast: {
      condition: dailyForecast.condition,
      chanceOfRain: dailyForecast.daily_chance_of_rain,
      chanceOfSnow: dailyForecast.daily_chance_of_snow,
      maxTemp: {
        c: dailyForecast.maxtemp_c,
        f: dailyForecast.maxtemp_f,

      },
      minTemp: {
        c: dailyForecast.mintemp_c,
        f: dailyForecast.mintemp_f,
      },
      sunrise,
      sunset,
    },
    current: {
      temperature: {
        c: currentTemperatureC,
        f: currentTemperatureF,
      },
      feelsLike: {
        c: currentFeelsLikeC,
        f: currentFeelsLikeF,
      },
      condition: currentWeatherCondition,
      wind: {
        c: currentWindC,
        f: currentWindF,
      },
      humidity: currentHumidity,
    },
  };
}
async function animateWeatherContainer() {
  weatherContainer.classList.add('fadeIn');
  weatherContainer.querySelector('#arrowElement').removeAttribute('hidden');
  // weatherContainer.querySelector('#downArrowElement').removeAttribute('hidden');
}

function removeAnimations() {
  weatherContainer.classList.remove('fadeIn');
}

function displayMetric(weatherData) {
  document.getElementById('currentTemperature').innerHTML = `${weatherData.current.temperature.c}<span>&#8451;</span>`;
  weatherContainer.querySelector('#currentFeelsLike').innerHTML = `Feels like: ${weatherData.current.feelsLike.c}<span>&#8451;</span>`;
  weatherContainer.querySelector('#currentWind').textContent = `Wind: ${weatherData.current.wind.c} KPH`;
  weatherContainer.querySelector('#maxTemp').innerHTML = `Max: ${weatherData.forecast.maxTemp.c}<span>&#8451;</span>`;
  weatherContainer.querySelector('#minTemp').innerHTML = `Min: ${weatherData.forecast.minTemp.c}<span>&#8451;</span>`;
  animateWeatherContainer();
}

function displayImperial(weatherData) {
  document.getElementById('currentTemperature').innerHTML = `${weatherData.current.temperature.f} <span>&#8457;</span> `;
  weatherContainer.querySelector('#currentFeelsLike').innerHTML = `Feels like: ${weatherData.current.feelsLike.f}<span>&#8457;</span>`;
  weatherContainer.querySelector('#currentWind').textContent = `Wind: ${weatherData.current.wind.f} MPH`;
  weatherContainer.querySelector('#maxTemp').innerHTML = `Max: ${weatherData.forecast.maxTemp.f}<span>&#8457;</span>`;
  weatherContainer.querySelector('#minTemp').innerHTML = `Min: ${weatherData.forecast.minTemp.f}<span>&#8457;</span>`;
  animateWeatherContainer();
}

function displayData(weatherData) {
  document.querySelector('#condition').textContent = weatherData.current.condition.text;
  weatherContainer.querySelector('#cityName').textContent = `${weatherData.cityDetails.name}, ${weatherData.cityDetails.country}`;
  weatherContainer.querySelector('#currentHumidity').textContent = `Humidity: ${weatherData.current.humidity}%`;
  weatherContainer.querySelector('#sunrise').textContent = `Sunrise: ${weatherData.forecast.sunrise}`;
  weatherContainer.querySelector('#sunset').textContent = `Sunset: ${weatherData.forecast.sunset}`;
  weatherContainer.querySelector('#chanceOfRain').textContent = `Chance of Rain: ${weatherData.forecast.chanceOfRain}%`;
  weatherContainer.querySelector('#chanceOfSnow').textContent = `Chance of Snow: ${weatherData.forecast.chanceOfSnow}%`;

  if (celsiusChosen === 'true') { displayMetric(weatherData); } else displayImperial(weatherData);
}

// Fetches weather data from server, creates an object to better access data//
async function getWeatherData(location) {
  removeAnimations();
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=1986480656ec490d950204923202611&q=${location}`,
     {
       mode: 'cors',
     },
  );
  if (response.status === 400) {
    errorMSG.textContent = 'Could not find the location. Please try again.';
  } else {
    const weatherData = await response.json();
    parsedWeatherData = processData(weatherData);
    errorMSG.textContent = '';
    displayData(parsedWeatherData);
  // reset();
  }
}
// eslint-disable-next-line no-unused-vars
// Function called by HTML//
function handleKeyPress(e) {
  const key = e.keyCode || e.which;
  if (key === 13) {
    e.preventDefault();
    const inputCityName = document.getElementById('weatherLocationInput').value;
    getWeatherData(inputCityName);
  }
}
// Event Listeners//

// Event listener for "right" arrow//

displayMoreWeatherButton.addEventListener('click', () => {
  const hiddenElements = document.querySelectorAll('[data-hidden-container]');
  if (expandContentButtonPressed) {
    hiddenElements.forEach((element) => {
      element.className = 'fade-out-left';
    });
    displayMoreWeatherButton.innerHTML = '<span>&#11208;</span>';
    displayMoreWeatherButton.classList.add('rightArrowAnimation');
    displayMoreWeatherButton.classList.remove('leftArrowAnimation');
    expandContentButtonPressed = false;
  } else {
    hiddenElements.forEach((element) => {
      element.style.display = 'inline';
      element.className = 'fade-in-left';
    });
    displayMoreWeatherButton.innerHTML = '<span>&#11207;</span>';
    displayMoreWeatherButton.classList.remove('rightArrowAnimation');
    displayMoreWeatherButton.classList.add('leftArrowAnimation');
    expandContentButtonPressed = true;
  }
});

// Event listener for search bar//
weatherSearchButton.addEventListener('click', (e) => {
  e.preventDefault();
  const inputCityName = document.getElementById('weatherLocationInput').value;
  getWeatherData(inputCityName);
});

// Event listener for degree switch//
degreeSwitchButton.addEventListener('click', () => {
  if (celsiusChosen === 'true') {
    celsiusChosen = 'false';
  } else {
    celsiusChosen = 'true';
  }
  sessionStorage.setItem('celsiusChosen', celsiusChosen);
  if (parsedWeatherData === undefined) return;
  if (celsiusChosen === 'true') {
    displayMetric(parsedWeatherData);
  } else {
    displayImperial(parsedWeatherData);
  }
});
