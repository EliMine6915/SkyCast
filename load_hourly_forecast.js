document.addEventListener("DOMContentLoaded", async function () {
    const apiKey = "DrK5Nyprt4T2Yu8Cr0kIhPhGif3NKUU2";
    const city = localStorage.getItem("selectedCity");

    if (!city) {
        window.location.href = "search.html";
        return;
    }

    try {
        // Stadt -> LocationKey abrufen
        const cityUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}&language=de-DE`;
        const cityResponse = await fetch(cityUrl);
        if (!cityResponse.ok) throw new Error("Stadt konnte nicht abgerufen werden");
        const cityDataArray = await cityResponse.json();
        const cityData = cityDataArray[0];
        const locationKey = cityData.Key;

        // Stunden-Vorhersage abrufen
        const hourlyUrl = `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${locationKey}?apikey=${apiKey}&language=de-DE&metric=true`;
        const hourlyResponse = await fetch(hourlyUrl);
        if (!hourlyResponse.ok) throw new Error("Stunden-Vorhersage konnte nicht geladen werden");
        const hourlyData = await hourlyResponse.json();

        for (let i = 0; i < 12; i++) {
            const hourData = hourlyData[i];
            const time = new Date(hourData.DateTime).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
            });
            const temperature = hourData.Temperature.Value;
            const rainProbability = hourData.PrecipitationProbability;
            const rainValue = hourData.Rain?.Value || 0;

            const timeCell = document.getElementById(`time${i + 1}`);
            const tempCell = document.getElementById(`temperature${i + 1}`);
            const rainCell = document.getElementById(`rain${i + 1}`);
            const rainValCell = document.getElementById(`rainvalue${i + 1}`);

            if (timeCell) timeCell.textContent = time;
            if (tempCell) tempCell.textContent = `${temperature}°C`;
            if (rainCell) rainCell.textContent = `${rainProbability}%`;
            if (rainValCell) rainValCell.textContent = `${rainValue} mm`;
        }

    } catch (error) {
        console.error("Fehler beim Laden der stündlichen Vorhersage:", error);
        const tableDiv = document.querySelector(".table");
        if (tableDiv) {
            tableDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    }
});
