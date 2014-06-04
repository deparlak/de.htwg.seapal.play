/**
 * weather.js
 *
 * Define the actions for the weather entry's.
 *
 */

 var seamap;

$(document).ready(function() {

    seamap = map

    /* handle leftclick events on a selected weather option */
    menu.addCallback('leftclick', 'icon-selected-weather', function (self) {
        if (self.data('type') == "weather") {
            switch (self.data('id')) {
                case "wind":
                	seamap.destWind();
                	$("#wind").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "temperature":
                    seamap.destTemperature();
                    $("#temperature").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "icons":
                    seamap.destWeatherIcon();
                    $("#icons").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "waveHeight":
                    seamap.destWaveHeight();
                    $("#waveHeight").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "precipitate":
                    seamap.destPrecipitation();
                    $("#precipitate").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "clouds":
                    seamap.destCloudLayer();
                    $("#clouds").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "owm":
                    seamap.destOpenWeaterMap();
                    $("#owm").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    break;
                case "weather-icons":
                    $("#weather-icons").removeClass('icon-selected-weather').addClass('icon-notSelected-weather');
                    seamap.destCustomLayer();
                    break;
                case "test":
                    seamap.destTest();
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
                    seamap.initWind();
                    break;
                case "temperature":
                    $("#temperature").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initTemperature();
                    break;
                case "icons":
                   $("#icons").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initWeatherIcon();
                    break;
                case "waveHeight":
                    $("#waveHeight").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initWaveHeight();
                    break;
                case "precipitate":
                    $("#precipitate").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initPrecipitation();
                    break;
                case "clouds":
                    $("#clouds").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initCloudLayer();
                    break;
                case "owm":
                    $("#owm").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initOpenWeaterMap();
                    break;
                case "weather-icons":
                    $("#weather-icons").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initCustomLayer();
                    break;
                case "test":
                    $("#test").removeClass('icon-notSelected-weather').addClass('icon-selected-weather');
                    seamap.initTest1();
                    break;
            }
        }
    });
});