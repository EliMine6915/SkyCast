document.addEventListener("DOMContentLoaded", async function () {
    const city = localStorage.getItem("selectedCity");

    if (!city) {
        window.location.href = "search.html";
        return;
    }

    const loaderContainer = document.getElementById("loader-container");
    const loaderBar = document.getElementById("loader-bar");
    if (loaderContainer && loaderBar) {
        loaderBar.style.width = "0%";
        loaderContainer.style.display = "block";
        loaderBar.style.animation = "loadingAnimation 2s linear forwards";
    }

    // WMO Weather Code -> Weather Icons Mapping
    const weatherIconMap = {
        day: {
            0: "wi-day-sunny", 1: "wi-day-sunny-overcast", 2: "wi-day-cloudy",
            3: "wi-cloudy", 45: "wi-fog", 48: "wi-fog",
            51: "wi-sprinkle", 53: "wi-sprinkle", 55: "wi-sprinkle",
            61: "wi-rain", 63: "wi-rain", 65: "wi-rain",
            71: "wi-snow", 73: "wi-snow", 75: "wi-snow",
            77: "wi-snowflake-cold", 80: "wi-day-showers", 81: "wi-showers",
            82: "wi-showers", 85: "wi-snow", 86: "wi-snow",
            95: "wi-thunderstorm", 96: "wi-thunderstorm", 99: "wi-thunderstorm"
        },
        night: {
            0: "wi-night-clear", 1: "wi-night-alt-cloudy", 2: "wi-night-alt-cloudy",
            3: "wi-cloudy", 45: "wi-night-fog", 48: "wi-night-fog",
            51: "wi-sprinkle", 53: "wi-sprinkle", 55: "wi-sprinkle",
            61: "wi-rain", 63: "wi-rain", 65: "wi-rain",
            71: "wi-snow", 73: "wi-snow", 75: "wi-snow",
            77: "wi-snowflake-cold", 80: "wi-night-alt-showers", 81: "wi-showers",
            82: "wi-showers", 85: "wi-snow", 86: "wi-snow",
            95: "wi-thunderstorm", 96: "wi-thunderstorm", 99: "wi-thunderstorm"
        }
    };

    try {
        // 1. Geocoding: Stadtname -> Koordinaten
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de`);
        if (!geoRes.ok) throw new Error("Stadt nicht gefunden");
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error("Stadt nicht gefunden");

        const { latitude, longitude, name: cityName, country } = geoData.results[0];
        document.getElementById("output").innerHTML = `<p>${cityName}, ${country}</p>`;

        // 2. Wetterdaten abrufen
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,` +
            `wind_direction_10m,weather_code,surface_pressure,uv_index,is_day` +
            `&daily=precipitation_sum,precipitation_probability_max,sunrise,sunset` +
            `&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error("Wetterdaten konnten nicht geladen werden");
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const daily = weatherData.daily;

        const temperature = current.temperature_2m;
        const feelsLike = current.apparent_temperature;
        const humidity = current.relative_humidity_2m;
        const windSpeed = current.wind_speed_10m;
        const windDir = current.wind_direction_10m;
        const pressure = current.surface_pressure;
        const uvIndex = current.uv_index;
        const isDayTime = current.is_day === 1;
        const weatherCode = current.weather_code;

        const rainValue = daily.precipitation_sum[0] ?? 0;
        const rainProbability = daily.precipitation_probability_max[0] ?? 0;
        const sunRise = daily.sunrise[0];
        const sunSet = daily.sunset[0];

        const riseDate = new Date(sunRise);
        const riseStunde = riseDate.getHours().toString().padStart(2, '0');
        const riseMinute = riseDate.getMinutes().toString().padStart(2, '0');
        const setDate = new Date(sunSet);
        const setStunde = setDate.getHours().toString().padStart(2, '0');
        const setMinute = setDate.getMinutes().toString().padStart(2, '0');

        // Windrichtung in Text umwandeln
        const windDirs = ["N","NO","O","SO","S","SW","W","NW"];
        const windDirText = windDirs[Math.round(windDir / 45) % 8];

        // Icon setzen
        const iconKey = isDayTime ? "day" : "night";
        const weatherIconClass = weatherIconMap[iconKey][weatherCode] || "wi-na";
        const iconElement = document.getElementById("weather-icon");
        if (iconElement) iconElement.className = `wi ${weatherIconClass}`;

        // Wetterdaten anzeigen
        document.getElementById("outputTemp").innerHTML = `<p>${temperature}°C</p>`;
        document.getElementById("outputFeel").innerHTML = `<p>Gefühlt wie ${feelsLike}°C</p>`;
        document.getElementById("uvindex").innerHTML = `<h2>UV-Index</h2><p>${uvIndex}</p>`;
        document.getElementById("wind").innerHTML = `<h2>Windgeschwindigkeit</h2><p>${windSpeed} km/h ${windDirText}</p>`;
        document.getElementById("luftfeuchtigkeit").innerHTML = `<h2>Luftfeuchtigkeit</h2><p>${humidity}%</p>`;
        document.getElementById("pressure").innerHTML = `<h2>Luftdruck</h2><p>${pressure} hPa</p>`;
        document.getElementById("value").innerHTML = `<h2>Regenmenge</h2><p>${rainValue} mm</p>`;
        document.getElementById("probability").innerHTML = `<h2>Regenwahrscheinlichkeit</h2><p>${rainProbability}%</p>`;
        document.getElementById("radar").innerHTML = `<h2>Regenradar</h2><p><a href="https://open-meteo.com/en/docs#latitude=${latitude}&longitude=${longitude}" target="_blank">Link zu einem Regenradar</a></p>`;

        if (isDayTime) {
            document.getElementById("sun").innerHTML = `<h2>Sonnenuntergang</h2><p>${setStunde}:${setMinute}</p>`;
        } else {
            document.getElementById("sun").innerHTML = `<h2>Sonnenaufgang</h2><p>${riseStunde}:${riseMinute}</p>`;
        }

    } catch (error) {
        document.getElementById("output").innerHTML = `<p style="color: red;">${error.message}</p>`;
    } finally {
        if (loaderContainer) loaderContainer.style.display = "none";
    }
});