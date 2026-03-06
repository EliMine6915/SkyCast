document.addEventListener("DOMContentLoaded", async function () {
    const city = localStorage.getItem("selectedCity");
    if (!city) {
        window.location.href = "search.html";
        return;
    }

    try {
        // Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de`);
        if (!geoRes.ok) throw new Error("Stadt nicht gefunden");
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error("Stadt nicht gefunden");

        const { latitude, longitude } = geoData.results[0];

        // Stündliche Vorhersage
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&hourly=temperature_2m,precipitation_probability,precipitation&timezone=auto&forecast_days=1`
        );
        if (!weatherRes.ok) throw new Error("Stunden-Vorhersage konnte nicht geladen werden");
        const weatherData = await weatherRes.json();

        const times = weatherData.hourly.time;
        const temps = weatherData.hourly.temperature_2m;
        const rainProbs = weatherData.hourly.precipitation_probability;
        const rainVals = weatherData.hourly.precipitation;

        for (let i = 0; i < 12; i++) {
            const time = new Date(times[i]).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

            const timeCell = document.getElementById(`time${i + 1}`);
            const tempCell = document.getElementById(`temperature${i + 1}`);
            const rainCell = document.getElementById(`rain${i + 1}`);
            const rainValCell = document.getElementById(`rainvalue${i + 1}`);

            if (timeCell) timeCell.textContent = time;
            if (tempCell) tempCell.textContent = `${temps[i]}°C`;
            if (rainCell) rainCell.textContent = `${rainProbs[i]}%`;
            if (rainValCell) rainValCell.textContent = `${rainVals[i]} mm`;
        }
    } catch (error) {
        console.error("Fehler beim Laden der stündlichen Vorhersage:", error);
        const tableDiv = document.querySelector(".table");
        if (tableDiv) tableDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
});