const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const city = 'Hyderabad'; // Replace with the desired city
const forecastDays = 5; // Number of forecast days

setInterval(() => {
    const time = new Date();
    const month = time.getMonth();
    const date = time.getDate();
    const day = time.getDay();
    const hour = time.getHours();
    const hoursIn12HrFormat = hour >= 13 ? hour % 12 : hour;
    const minutes = time.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    timeEl.innerHTML = (hoursIn12HrFormat < 10 ? '0' + hoursIn12HrFormat : hoursIn12HrFormat) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
    dateEl.innerHTML = days[day] + ', ' + date + ' ' + months[month];

}, 1000);

async function fetchWeatherData() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        showWeatherData(data);
        
        // Check for weather alerts
        checkForAlerts(data);

        fetchForecastData();
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

async function fetchForecastData() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&cnt=${forecastDays}&appid=${API_KEY}`);
        const data = await response.json();
        updateWeatherForecast(data);
    } catch (error) {
        console.error('Error fetching forecast data:', error);
    }
}

function showWeatherData(data) {
    const { humidity, pressure, sunrise, sunset, wind_speed } = data.main;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = `${data.sys.country}`;

    currentWeatherItemsEl.innerHTML = `
        <div class="weather-item">
            <div>Humidity</div>
            <div>${humidity}%</div>
        </div>
        <div class="weather-item">
            <div>Pressure</div>
            <div>${pressure} hPa</div>
        </div>
        <div class="weather-item">
            <div>Wind Speed</div>
            <div>${wind_speed} m/s</div>
        </div>
        <div class="weather-item">
            <div>Sunrise</div>
            <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
        </div>
                <div class="weather-item">
            <div>Sunset</div>
            <div>${window.moment(sunset * 1000).format('HH:mm a')}</div>
        </div>
    `;

    // Display current temperature
    currentTempEl.innerHTML = `
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="weather icon" class="w-icon">
        <div class="other">
            <div class="day">${window.moment().format('dddd')}</div>
            <div class="temp">Temperature - ${data.main.temp}&#176;C</div>
        </div>
    `;
}

function updateWeatherForecast(data) {
    const weatherForecastContainer = document.getElementById('weather-forecast');
    weatherForecastContainer.innerHTML = ''; // Clear existing content

    data.list.forEach((item) => {
        const weatherItem = document.createElement('div');
        weatherItem.classList.add('weather-forecast-item');

        const date = new Date(item.dt * 1000);
        const day = date.toLocaleString('en-US', { weekday: 'short' });
        const dayTemp = item.main.temp_max.toFixed(1);
        const nightTemp = item.main.temp_min.toFixed(1);
        const weatherIcon = item.weather[0].icon;

        weatherItem.innerHTML = `
            <div class="day">${day}</div>
            <img src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="weather icon" class="w-icon">
            <div class="temp">Night - ${nightTemp}&#176; C</div>
            <div class="temp">Day - ${dayTemp}&#176; C</div>
        `;

        weatherForecastContainer.appendChild(weatherItem);
    });
}

fetchWeatherData();
function checkForAlerts(data) {
    const alertsContainer = document.getElementById('alerts'); 

    alertsContainer.innerHTML = '';

    if (data.main.temp > 35) {
        alertsContainer.innerHTML += `<div class="alert">🔥 Heat Alert: Temperature is above 35°C!</div>`;
    }
    if (data.weather[0].main === 'Rain') {
        alertsContainer.innerHTML += `<div class="alert">☔ Rain Alert: It's going to rain!</div>`;
    }
    if (data.wind.speed > 10) {
        alertsContainer.innerHTML += `<div class="alert">💨 Wind Alert: Wind speed is above 10 m/s!</div>`;
    }
    
}