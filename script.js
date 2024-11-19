const API_KEY = "4a3bb556310e552771710aaa50571776"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const errorMessage = document.getElementById("errorMessage");
const weatherCards = document.getElementById("weatherCards");
const forecastCards = document.getElementById("forecastCards");
const recentSearchesDropdown = document.getElementById("recentSearches");

const recentSearches = []; // Array to store recent searches

// Function to fetch weather data
function fetchWeather(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            errorMessage.classList.add("hidden");
            displayWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon); // Fetch forecast data
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove("hidden");
            weatherCards.innerHTML = ""; // Clear previous data
            forecastCards.innerHTML = ""; // Clear previous data
        });
}

// Fetch weather by city
function fetchWeatherByCity(city) {
    const url = `${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`;
    fetchWeather(url);
}

// Fetch weather by location
function fetchWeatherByLocation(lat, lon) {
    const url = `${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    fetchWeather(url);
}

// Fetch 5-day forecast data
function fetchForecast(lat, lon) {
    const url = `${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayForecast(data.list);
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
        });
}
// Display current weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    const weatherIconCode = weather[0].icon; // Get the icon code from the response
    const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@4x.png`; 

    const weatherCard = `
        <h2 class="text-2xl font-bold mb-2">${name}</h2>
        <img src="${weatherIconUrl}" alt="${weather[0].description}" class="mx-auto mb-4 w-24 h-24 border-4 border-white rounded-full shadow-lg"> <!-- Enhanced icon style -->
        <div class="text-4xl font-bold mb-2">${Math.round(main.temp)}°C</div>
        <div class="mt-4">
            <p class="text-gray-300">Humidity: ${main.humidity}%</p>
            <p class="text-gray-300">Pressure: ${main.pressure} hPa</p>
            <p class="text-gray-300">Wind Speed: ${Math.round(wind.speed * 3.6)} km/h</p>
        </div>
    `;
    weatherCards.innerHTML = weatherCard;
}

// Display 5-day forecast data
function displayForecast(forecastData) {
    forecastCards.innerHTML = ''; // Clear previous forecast data
    for (let i = 0; i < forecastData.length; i += 8) { 
        const { dt, main, weather, wind } = forecastData[i];
        const weatherIconCode = weather[0].icon; // Get the icon code from forecast data
        const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIconCode}@4x.png`; // Use 4x for better quality

        const forecastCard = `
            <div class="bg-blue-700 p-3 rounded-lg flex flex-col items-center text-center w-32">
                <h3 class="text-lg font-semibold">${new Date(dt * 1000).toLocaleDateString()}</h3>
                <img src="${weatherIconUrl}" alt="${weather[0].description}" class="w-16 h-16 my-2"> <!-- Forecast icon style -->
                <p class="text-sm text-gray-300">${weather[0].description}</p>
                <p class="text-lg font-bold">${Math.round(main.temp)}°C</p>
                <p class="text-sm text-gray-300">Humidity: ${main.humidity}%</p>
                <p class="text-sm text-gray-300">Pressure: ${main.pressure} hPa</p>
                <p class="text-sm text-gray-300">Wind: ${Math.round(wind.speed * 3.6)} km/h</p>
            </div>
        `;
        forecastCards.innerHTML += forecastCard;
    }
}

// Update recent searches
function updateRecentSearches(city) {
    if (!recentSearches.includes(city)) {
        recentSearches.unshift(city);
        if (recentSearches.length > 5) recentSearches.pop(); // Limit to 5
        populateRecentSearchesDropdown();
    }
}

// Populate the dropdown with recent searches
function populateRecentSearchesDropdown() {
    recentSearchesDropdown.innerHTML = `<option value="" disabled selected>Select a recent search</option>`;
    recentSearches.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentSearchesDropdown.appendChild(option);
    });
}

// Handle dropdown selection
recentSearchesDropdown.addEventListener("change", (event) => {
    const city = event.target.value;
    if (city) {
        fetchWeatherByCity(city);
    }
});

// Event listeners
searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        updateRecentSearches(city);
    } else {
        errorMessage.textContent = "Please enter a city name.";
        errorMessage.classList.remove("hidden");
    }
});

locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Log the latitude and longitude to debug
                console.log("Latitude: ", latitude, "Longitude: ", longitude);
                
                // Fetch weather data based on the latitude and longitude
                fetchWeatherByLocation(latitude, longitude);
            },
            (error) => {
                console.error("Geolocation Error: ", error);
                errorMessage.textContent = "Unable to fetch your location.";
                errorMessage.classList.remove("hidden");
            }
        );
    } else {
        errorMessage.textContent = "Geolocation is not supported by your browser.";
        errorMessage.classList.remove("hidden");
    }
});

// Default city (Noida)
fetchWeatherByCity("Noida");
