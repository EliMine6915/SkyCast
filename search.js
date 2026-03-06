document.addEventListener("DOMContentLoaded", async function () {
    const errorElement = document.getElementById("error");

    document.getElementById("cityInput").addEventListener("submit", async function (event) {
        event.preventDefault();
        const city = document.getElementById("city").value.trim();

        if (city === "") {
            alert("Bitte gib eine Stadt ein!");
            return;
        }

        try {
            // Prüfen ob Stadt existiert
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de`);
            if (!geoRes.ok) throw new Error("Stadt konnte nicht gefunden werden");
            const geoData = await geoRes.json();
            if (!geoData.results || geoData.results.length === 0) throw new Error("Stadt nicht gefunden");

            localStorage.setItem("selectedCity", city);
            window.location.href = "forecast.html";
        } catch (error) {
            console.error("Fehler:", error);
            if (errorElement) errorElement.style.display = "block";
        }
    });
});