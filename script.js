const apiKey = "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}"; // Replace with your OpenWeatherMap API key

async function searchWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            alert("City not found");
            return;
        }

        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data.");
    }
}

function updateWeatherUI(data) {
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const visibility = (data.visibility / 1000).toFixed(1); // in km
    const description = capitalize(data.weather[0].description);

    // Update main weather box (BOX1)
    document.querySelector("#BOX1 h1").innerHTML = `${temperature}&deg;`;
    document.querySelector("#BOX1 h3").textContent = description;
    document.querySelector("#BOX1 p").textContent = 
        `Today, expect ${description.toLowerCase()} with temperatures reaching up to ${temperature}°C.`;

    // Update small boxes
    const boxes = document.querySelectorAll(".box");

    // Feels Like
    boxes[0].querySelector("h2").textContent = `${feelsLike}°C`;
    boxes[0].querySelector("p").textContent = `Feels like temperature`;

    // Precipitation — not directly in current weather, showing dash
    boxes[1].querySelector("h2").textContent = "—";
    boxes[1].querySelector("p").textContent = "Precipitation info unavailable";

    // Visibility
    boxes[2].querySelector("h2").textContent = `${visibility} km`;
    boxes[2].querySelector("p").textContent = "Visibility";

    // Humidity
    boxes[3].querySelector("h2").textContent = `${humidity}%`;
    boxes[3].querySelector("p").textContent = `Humidity level`;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Optional: Trigger search on Enter key press
document.getElementById("cityInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        searchWeather();
    }
});
