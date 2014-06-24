/**
 * weather.js
 *
 * Define the actions for the weather entry's.
 *
 */

$(document).ready(function() {

    /* handle leftclick events on a selected weather option */
    menu.addCallback('leftclick', 'icon-selected-weather', function (self) {
        if (self.data('type') == "weather") {
            switch (self.data('id')) {
                case "wind":
                	map.destWind();
                	$("#wind").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "temperature":
                    map.destTemperature();
                    $("#temperature").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "icons":
                    map.destWeatherIcon();
                    $("#icons").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "waveHeight":
                    map.destWaveHeight();
                    $("#waveHeight").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "precipitate":
                    map.destPrecipitation();
                    $("#precipitate").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "clouds":
                    map.destCloudLayer();
                    $("#clouds").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "owm":
                    map.destOpenWeaterMap();
                    $("#owm").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "weather-icons":
                    $("#weather-icons").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    map.destCustomLayer();
                    break;
                case "test":
                    map.destTest();
                    $("#test").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
            }
        }
    });

    /* handle leftclick events on a not selected weather option */
    menu.addCallback('leftclick', 'icon-notSelected-weather', function (self) {
        if (self.data('type') == "weather") {
            switch (self.data('id')) {
                case "wind":
                	$("#wind").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initWind();
                    break;
                case "temperature":
                    $("#temperature").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initTemperature();
                    break;
                case "icons":
                   $("#icons").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initWeatherIcon();
                    break;
                case "waveHeight":
                    $("#waveHeight").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initWaveHeight();
                    break;
                case "precipitate":
                    $("#precipitate").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initPrecipitation();
                    break;
                case "clouds":
                    $("#clouds").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initCloudLayer();
                    break;
                case "owm":
                    $("#owm").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initOpenWeaterMap();
                    break;
                case "weather-icons":
                    $("#weather-icons").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initCustomLayer();
                    break;
                case "test":
                    $("#test").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    map.initTest1();
                    break;
            }
        }
    });
});