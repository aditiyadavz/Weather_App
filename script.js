const API_KEY = "aa96e7d600f741401ddd77deff813519";
let currentUnit = "metric";
let isCelsius = true;

const cityInput = document.getElementById("cityInput");
const weatherInfo = document.getElementById("weatherInfo");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");

function getIconUrl(code) {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

function showLoading(isLoading) {
  loading.style.display = isLoading ? "block" : "none";
}

function getWeatherByCity() {
  const city = cityInput.value.trim();
  if (!city) return;
  fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`,
    true
  );
  cityInput.value = "";
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation not supported.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${currentUnit}&appid=${API_KEY}`,
        true
      );
    },
    () => {
      showError("Unable to get your location.");
    }
  );
}

function fetchWeather(url, fetchExtras = false) {
  showLoading(true);
  errorDiv.textContent = "";
  weatherInfo.style.display = "none";

  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject("City not found")))
    .then(data => {
      updateWeather(data);
      if (fetchExtras) {
        const { lat, lon } = data.coord;
        fetchUVAndExtras(lat, lon);
      }
    })
    .catch(err => showError(err))
    .finally(() => showLoading(false));
}

function fetchUVAndExtras(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${currentUnit}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      updateExtras(data.current);
    });
}

function updateWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconUrl = getIconUrl(iconCode);
  document.getElementById("weatherEmoji").innerHTML = `<img src="${iconUrl}" alt="icon" width="60" height="60">`;
  document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°${isCelsius ? "C" : "F"}`;
  document.getElementById("condition").textContent = data.weather[0].description;
  document.getElementById("location").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("hiLow").textContent = `H: ${Math.round(data.main.temp_max)}° / L: ${Math.round(data.main.temp_min)}°`;
  document.getElementById("windSpeed").textContent = `Wind: ${data.wind.speed} m/s`;
  weatherInfo.style.display = "block";
}

function updateExtras(current) {
  const extrasContainer = document.getElementById("extras");
  extrasContainer.innerHTML = "";

  const cards = [
    {
      title: "Humidity",
      value: `${current.humidity}%`,
      iconUrl: "https://cdn-icons-png.flaticon.com/512/728/728093.png"
    },
    {
      title: "UV Index",
      value: current.uvi,
      iconUrl: "https://cdn-icons-png.flaticon.com/512/169/169367.png"
    },
    {
      title: "Precipitation",
      value: `${Math.round((current.pop || 0) * 100)}%`,
      iconUrl: "https://cdn-icons-png.flaticon.com/512/414/414974.png"
    }
  ];

  cards.forEach(card => {
    const div = document.createElement("div");
    div.className = "info-card";
    div.innerHTML = `
      <img src="${card.iconUrl}" alt="${card.title} icon" class="card-icon" width="40" height="40">
      <div class="card-title">${card.title}</div>
      <div class="card-value">${card.value}</div>
    `;
    extrasContainer.appendChild(div);
  });
}

function showError(message) {
  errorDiv.textContent = message;
}

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  currentUnit = isCelsius ? "metric" : "imperial";
  unitToggle.textContent = isCelsius ? "Switch to °F" : "Switch to °C";

  const locationText = document.getElementById("location").textContent;
  if (locationText && locationText.includes(",")) {
    const city = locationText.split(",")[0].trim();
    fetchWeather(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${API_KEY}`,
      true
    );
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});