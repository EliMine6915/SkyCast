document.addEventListener("DOMContentLoaded", async function () {
    const apiKey = "DrK5Nyprt4T2Yu8Cr0kIhPhGif3NKUU2";
    const weatherApiKey = "600ef9ad22df4f578d164652252205"
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

    // Mapping AccuWeather ID -> Weather Icons Klasse
    const weatherIconMappings = {
        day: {
            1: "wi-day-sunny",
            2: "wi-day-sunny-overcast",
            3: "wi-day-cloudy",
            4: "wi-day-cloudy-high",
            5: "wi-day-haze",
            6: "wi-day-cloudy",
            7: "wi-cloudy",
            8: "wi-cloudy",
            11: "wi-fog",
            12: "wi-showers",
            13: "wi-day-showers",
            14: "wi-day-showers",
            15: "wi-thunderstorm",
            16: "wi-day-thunderstorm",
            17: "wi-day-thunderstorm",
            18: "wi-rain",
            19: "wi-sleet",
            20: "wi-snow",
            21: "wi-snow",
            22: "wi-snow-wind",
            23: "wi-snowflake-cold",
            24: "wi-snowflake-cold",
            25: "wi-sleet",
            26: "wi-freezing-rain",
            29: "wi-rain-mix",
            30: "wi-hot",
            31: "wi-snowflake-cold",
            32: "wi-windy",
            33: "wi-day-sunny",
            34: "wi-day-cloudy",
            35: "wi-day-cloudy-high",
            36: "wi-day-cloudy-high",
            37: "wi-day-fog",
            38: "wi-day-showers",
            39: "wi-day-showers",
            40: "wi-day-rain",
            41: "wi-day-thunderstorm",
            42: "wi-day-thunderstorm",
            43: "wi-day-snow",
            44: "wi-day-snow"
        },
        night: {
            1: "wi-night-clear",
            2: "wi-night-alt-cloudy",
            3: "wi-night-alt-cloudy",
            4: "wi-night-alt-cloudy-high",
            5: "wi-night-alt-cloudy",
            6: "wi-night-alt-cloudy",
            7: "wi-cloudy",
            8: "wi-cloudy",
            11: "wi-fog",
            12: "wi-night-alt-showers",
            13: "wi-night-alt-showers",
            14: "wi-night-alt-showers",
            15: "wi-thunderstorm",
            16: "wi-night-alt-thunderstorm",
            17: "wi-night-alt-thunderstorm",
            18: "wi-rain",
            19: "wi-sleet",
            20: "wi-snow",
            21: "wi-snow",
            22: "wi-snow-wind",
            23: "wi-snowflake-cold",
            24: "wi-snowflake-cold",
            25: "wi-sleet",
            26: "wi-freezing-rain",
            29: "wi-rain-mix",
            30: "wi-hot",
            31: "wi-snowflake-cold",
            32: "wi-windy",
            33: "wi-night-clear",
            34: "wi-night-alt-cloudy",
            35: "wi-night-alt-cloudy-high",
            36: "wi-night-alt-cloudy-high",
            37: "wi-night-fog",
            38: "wi-night-alt-showers",
            39: "wi-night-alt-showers",
            40: "wi-night-alt-rain",
            41: "wi-night-alt-thunderstorm",
            42: "wi-night-alt-thunderstorm",
            43: "wi-night-alt-snow",
            44: "wi-night-alt-snow"
        }
    };

  try {
        // Stadtinformationen abrufen
        const cityUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}&language=de-DE`;
        const cityResponse = await fetch(cityUrl);
        if (!cityResponse.ok) throw new Error(`Fehler beim Abrufen der Stadt: ${cityResponse.status}`);
        const cityDataArray = await cityResponse.json();
        if (cityDataArray.length === 0) throw new Error("Stadt nicht gefunden");

        const cityData = cityDataArray[0];
        const locationKey = cityData.Key;
        const cityName = cityData.LocalizedName;
        const cityPostalCode = cityData.PrimaryPostalCode;
        const countryName = cityData.Country.LocalizedName;

        document.getElementById("output").innerHTML = `<p>${cityName}, ${countryName}</p>`;
        localStorage.setItem("selectedCity", city);

        // Aktuelles Wetter abrufen
        const currentConditionsUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&language=de-DE&details=true&metric=true`;
        const currentConditionsResponse = await fetch(currentConditionsUrl);
        if (!currentConditionsResponse.ok) throw new Error(`Fehler beim Abrufen der aktuellen Wetterdaten: ${currentConditionsResponse.status}`);
        const currentConditionsData = await currentConditionsResponse.json();
        const currentCondition = currentConditionsData[0];

        // Tagesvorhersage abrufen
        const forecastUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${apiKey}&language=de-DE&details=true&metric=true`;
        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) throw new Error(`Fehler beim Abrufen der Vorhersage: ${forecastResponse.status}`);
        const forecastData = await forecastResponse.json();
        const dailyForecast = forecastData.DailyForecasts[0];

        // Wetterdaten extrahieren
        const iconId = currentCondition.WeatherIcon;
        const isDayTime = currentCondition.IsDayTime;
        const currentTemperature = currentCondition.Temperature.Metric.Value;
        const realFeelTemperature = currentCondition.RealFeelTemperature.Metric.Value;
        const humidity = currentCondition.RelativeHumidity;
        const windSpeed = currentCondition.Wind.Speed.Metric.Value;
        const pressure = currentCondition.Pressure.Metric.Value;
        const UVIndex = currentCondition.UVIndex;
        const windDirection = currentCondition.Wind.Direction.English;
        const RainValue = dailyForecast.Day?.Rain?.Value ?? 0;
        const rainProbability = dailyForecast.Day?.RainProbability ?? 0;
        const sunRise = dailyForecast.Sun.Rise;
        const sunSet = dailyForecast.Sun.Set;

        const riseDate = new Date(sunRise);
        const riseStunde = riseDate.getHours().toString().padStart(2, '0');
        const riseMinute = riseDate.getMinutes().toString().padStart(2, '0');
        const setDate = new Date(sunSet);
        const setStunde = setDate.getHours().toString().padStart(2, '0');
        const setMinute = setDate.getMinutes().toString().padStart(2, '0');

        // Icon setzen
        const weatherIconClass = weatherIconMappings[isDayTime ? "day" : "night"][iconId] || "wi-na";
        const iconElement = document.getElementById("weather-icon");
        if (iconElement) {
            iconElement.className = `wi ${weatherIconClass}`;
        }

        // Wetterdaten anzeigen
        document.getElementById("outputTemp").innerHTML = `<p>${currentTemperature}°C</p>`;
        document.getElementById("outputFeel").innerHTML = `<p>Gefühlt wie ${realFeelTemperature}°C</p>`;
        document.getElementById("uvindex").innerHTML = `<h2>UV-Index</h2><p>${UVIndex}</p>`;
        document.getElementById("wind").innerHTML = `<h2>Windgeschwindigkeit</h2><p>${windSpeed} km/h</p>`;
        document.getElementById("luftfeuchtigkeit").innerHTML = `<h2>Luftfeuchtigkeit</h2><p>${humidity}%</p>`;
        document.getElementById("pressure").innerHTML = `<h2>Luftdruck</h2><p>${pressure} hPa</p>`;
        document.getElementById("value").innerHTML = `<h2>Regenmenge</h2><p>${RainValue} mm</p>`;
        document.getElementById("probability").innerHTML = `<h2>Regenwahrscheinlichkeit</h2><p>${rainProbability}%</p>`;
        document.getElementById("radar").innerHTML = `<h2>Regenradar</h2><p><a href="https://www.accuweather.com/de/de/${cityName}/${cityPostalCode}/weather-radar/${locationKey}" target="_blank">Link zu einem Regenradar</a></p>`;

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