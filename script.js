
const form = document.querySelector("#weatherForm");
const cityInput = document.querySelector("#cityInput");
const message = document.querySelector("#message");
const garden = document.querySelector("#weatherGarden");

const getWeatherDescription = (code) => {
    const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Heavy drizzle",
        61: "Light rain",
        63: "Rainy",
        65: "Heavy rain",
        71: "Light snow",
        73: "Snowy",
        75: "Heavy snow",
        80: "Rain showers",
        81: "Showers",
        82: "Heavy showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Heavy thunderstorm"
    };

    return descriptions[code] || "Weather conditions";
};

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) return;

    message.textContent = "Fetching weather...";
    garden.hidden = true;

    try {
        // Step 1: Find city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const place = geoData.results[0];
        const { latitude, longitude, name, country } = place;

        // Step 2: Fetch actual weather data
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Weather data is temporarily unavailable.");
        }

        const weather = await weatherResponse.json();
        const current = weather.current;
        const daily = weather.daily;

        // Step 3: Put real data inside the flower cards
        document.querySelector("#cityName").textContent =
            `${name}, ${country}`;

        document.querySelector("#temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.querySelector("#condition").textContent =
            getWeatherDescription(current.weather_code);

        document.querySelector("#feelsLike").textContent =
            `Feels like ${Math.round(current.apparent_temperature)}°C`;

        document.querySelector("#humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.querySelector("#wind").textContent =
            `${current.wind_speed_10m} km/h`;

        document.querySelector("#minTemp").textContent =
            `${Math.round(daily.temperature_2m_min[0])}°C`;

        document.querySelector("#maxTemp").textContent =
            `${Math.round(daily.temperature_2m_max[0])}°C`;

        garden.hidden = false;
        message.textContent = "Weather updated successfully!";

    } catch (error) {
        message.textContent = error.message;
        garden.hidden = true;
        console.error(error);
    }
});
