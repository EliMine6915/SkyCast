document.addEventListener("DOMContentLoaded", async function () {
    // Dein API-Key (sollte vorher definiert werden)
    const apiKey = "DrK5Nyprt4T2Yu8Cr0kIhPhGif3NKUU2";
    const errorElement = document.getElementById("error");

    // Event-Listener für das Formular
    document.getElementById("cityInput").addEventListener("submit", async function(event) {
        event.preventDefault(); // Verhindert das Neuladen der Seite

        const city = document.getElementById("city").value.trim(); // Stadtname vom Benutzer abholen

        if (city === "") {
            alert("Bitte gib eine Stadt ein!");
            return; // Beendet die Funktion, wenn keine Stadt eingegeben wurde
        }

        try {
            // API-URL zur Suche nach der Stadt
            const cityUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}&language=de-DE`;
            const cityResponse = await fetch(cityUrl);

            if (!cityResponse.ok) throw new Error(`Fehler beim Abrufen der Stadt: ${cityResponse.status}`);

            const cityDataArray = await cityResponse.json();
            if (cityDataArray.length === 0) throw new Error("Stadt nicht gefunden");

            // Stadtname speichern (für später in forecast.html)
            localStorage.setItem("selectedCity", city);

            // Weiterleitung auf die Wetterseite
            window.location.href = "forecast.html"; // Leitet zur Wetterseite weiter

        } catch (error) {
            console.error("Fehler:", error);
        } finally {
            if (errorElement) errorElement.style.display = "block";
        }
    });
});
