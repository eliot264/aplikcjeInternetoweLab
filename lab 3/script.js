const apiKey = '7ded80d91f2b280ec979100cc8bbba94';

const fahrenheitToCelsius = (temp) => {return (5 / 9) * (temp - 32)};

const getPlaceInfo = async function(cityName){
    const response = await fetch("http://api.openweathermap.org/geo/1.0/direct?" + new URLSearchParams({
        q: cityName,
        appid: apiKey
    }), {method: "GET"});
    const data = await response.json();
    return data;
}

const currentWeather = async function(lat, lon){
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open("GET", "https://api.openweathermap.org/data/2.5/weather?" + new URLSearchParams({
        lat: lat,
        lon: lon,
        units: "metric",
        appid: apiKey
    }), true);
    req.onload = function() {
        var response = req.response;

        var div = document.getElementById("current");

        var p1 = document.createElement("p");
        p1.innerText =  "Temp:" + response.main.temp + "°C";
        div.appendChild(p1);

        var p2 = document.createElement("p");
        p2.innerText =  "Temp min:" + response.main.temp_min + "°C";
        div.appendChild(p2);

        var p3 = document.createElement("p");
        p3.innerText =  "Temp max:" + response.main.temp + "°C";
        div.appendChild(p3);
    };
    req.send(null);
}

const forecast5 = async function(lat, lon){
    fetch("http://api.openweathermap.org/data/2.5/forecast?" + new URLSearchParams({
        lat: lat,
        lon: lon,
        units: "metric",
        appid: apiKey
    })).then(function(response){
        return response.json()
    }).then(function(data) {
        var div = document.getElementById("forecast5");
        for(var i = 0; i < 5; i++){
            var p = document.createElement("p");
            p.textContent = "Day: " + (i + 1) + ", temp = " + data.list[i].main.temp + "°C";
            div.appendChild(p);
        }
    });
}

const buttonFunction = function(){
    var cityName = document.getElementById("place").value;

    fetch("http://api.openweathermap.org/geo/1.0/direct?" + new URLSearchParams({
        q: cityName,
        appid: apiKey
    }), {method: "GET"}).then(function(response){
        return response.json()
    }).then(function(data) {
        var lat = data[0].lat;
        var lon = data[0].lon;

        forecast5(lat, lon);
        currentWeather(lat, lon);
    });
}