let temp = document.querySelector("#temperature");
let iconToday = document.querySelector(".icon-today");
let place = document.querySelector("#city");
let date = document.querySelector("#current-date");
let humidity = document.querySelector("#humidity");;
let precipitation = document.querySelector("#precipitation");
let wind = document.getElementById("wind");
let localTime = document.querySelector("#local-time");
let form = document.querySelector("form");
let feelLike = document.getElementById("feel-like");

let forecastElements = document.querySelector(".forecast");

let lineChart = document.getElementById("chart");

let apiKey = "fd3150a661c1ddc90d3aefdec0400de4";

const xlabels = [];
const ylabels = [];



/************Search current weather condition **************/


function showDate(date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    let months = [
      `January`,
      `February`,
      `March`,
      `April`,
      `May`,
      `May`,
      `July`,
      `August`,
      `September`,
      `October`,
      `November`,
      `December`,
    ];
    let day = date.getDate();
    return `${year} ${months[month]} ${day}` ;
}

function formatTime(timestamp) {
  let date = new Date(timestamp);
  let day = date.getDay();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if(hours < 10 ){
    hours=  "0" +  hours ;
}
  if(minutes < 10 ){
    minutes =  "0" +  minutes ;
}
  return `${days[day]} ${hours} : ${minutes}`;
}
function showDay(timestamp){
  let date = new Date(timestamp * 1000);
  let day = date.getDay();
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day];
}


function displayForecast(response) {
  let forecast = response.data.daily;

  let forecastHTML = "";
  forecast.forEach((forecastDay, index) => {
    if (index < 6) {
      forecastHTML += `  
        <div class="days__block">
        <div class="block-date">${showDay(forecastDay.dt)}</div>
        <img src="icons/${forecastDay.weather[0].icon}.svg"
          class="block-image" alt="" width="42">
        <div class="block-temps">
          <span class="temperature-max"> ${Math.round(
            forecastDay.temp.max
          )}° </span>
        <span class="temperature-min"> ${Math.round(
          forecastDay.temp.min
        )}° </span>
    </div>
    </div>`;
    }
  });

  forecastElements.innerHTML = forecastHTML;
}




function getForecast(coordinates) {
  // console.log(coordinates);
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast);
}


let interval;
function searchWeather(location){
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?&appid=${apiKey}&units=metric`;
    axios.get(weatherUrl + "&" + location).then((response) => {
      console.log(response);
      let lat = response.data.coord.lat;
      let long = response.data.coord.lon;
      place.innerHTML = response.data.name;
      date.innerHTML = showDate(new Date());
      celsiusTemperature = response.data.main.temp;
      temp.innerHTML = Math.round(celsiusTemperature);
      let maxTemp = document.querySelector(".max-temp");
      maxTemp.innerHTML = `${Math.round(response.data.main.temp_max)}°` ;
      let minTemp = document.querySelector(".min-temp");
      minTemp.innerHTML = `${Math.round(response.data.main.temp_min)}°`;
      humidity.innerHTML = Math.round(response.data.main.humidity);
      wind.innerHTML = Math.round(response.data.wind.speed);
      clearInterval(interval);
      interval = setInterval(() => {
        const localOffset = new Date().getTimezoneOffset() * 60000;
        const local = new Date().getTime();
        const currentUtcTime = localOffset + local;
        const timeZone = response.data.timezone;
        const cityOffset = currentUtcTime + 1000 * timeZone;
        localTime.innerHTML = formatTime(cityOffset);
      }, 1000);
        feelLike.innerHTML = parseInt(response.data.main.feels_like);
        iconToday.setAttribute(
          "src",
          `icons/${response.data.weather[0].icon}.svg`
        );
        getForecast(response.data.coord);

          /***** Creating dynamic graph chart ******/
            makeChart();
            async function makeChart() {
              await getData();
              window.lineChart = new Chart(lineChart, {
                type: "line",
                data: {
                  labels: xlabels,
                  datasets: [
                    {
                      data: ylabels,
                      backgroundColor: "#03071e",
                      borderColor: "#000",
                      borderWidth: 1.5,
                      hoverBackgroundColor: "#5a6275",
                      hoverBorderColor: "rgba(222, 226, 230)",
                      tension: 0.4,
                    },
                  ],
                },

                options: {
                  scales: {
                    y: {
                      stacked: true,
                      grid: {
                        display: true,
                        color: "rgb(233, 236, 239)",
                      },
                      ticks: {
                        callback: function (value, index, ticks) {
                          return value + "°";
                        },
                      },
                    },
                    x: {
                      stacked: true,
                      grid: {
                        display: false,
                      },
                      time: {
                        unit: "day",
                        unitStepSize: 1,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                },
              });
            }

            if (window.lineChart != null) {
              window.lineChart.destroy();
              window.lineChart = null;
            }

            async function getData() {
              let forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude={part}&appid=${apiKey}&units=metric`;
              let response = await fetch(forecastUrl);
              let data = await response.json();

              const array = data.hourly;
              console.log(array);

              for (var prop in array) {
                if (Object.prototype.hasOwnProperty.call(array, prop)) {
                  let temp = Math.round(array[prop].temp);
                  ylabels.push(temp);

                  let arrayTime = new Date(array[prop].dt * 1000);
                  if (xlabels.length > 8) {
                    xlabels.splice(0, 8);
                  }
                  let hours = arrayTime.getHours();
                  let amPM = hours < 10 ? "AM" : "PM";
                  let minute = arrayTime.getMinutes();
                  let chartMinute = minute < 10 ? "00" : "30";
                  xlabels.push(`${hours} : ${chartMinute}  ${amPM}`);
                }
              }
              return data;
            }
    })
}

let searchInput = document.getElementById("search");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  var city = searchInput.value;
  console.log(city);
  if (searchInput.value) {
    searchInput.value = null;
  }

  searchWeather(`q= ${city}`);
});



/*******  Converting celsius to Fahrenheit ********/
function convertFahrenheit(event) {
  event.preventDefault();
  celsiusBtn.classList.remove("active");
  fahrenheitBtn.classList.add("active");
  let fahrenheiTemperature = (celsiusTemperature * 9) / 5 + 32;
  temperature.innerHTML = Math.round(fahrenheiTemperature);
}

function convertCelsius(event) {
  event.preventDefault();
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");
  temperature.innerHTML = Math.round(celsiusTemperature);
}

let fahrenheitBtn = document.querySelector(".fahrenheit");
fahrenheitBtn.addEventListener("click", convertFahrenheit);

let celsiusBtn = document.querySelector(".celsius");
celsiusBtn.addEventListener("click", convertCelsius);


searchWeather("q=tehran");
