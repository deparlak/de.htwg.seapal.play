var lng = new Array();
var lat = new Array();
var deg = new Array();
var speed = new Array();
var temp = new Array();
var icon = new Array();

var overlay;
var map;
var dfd = $.Deferred();

USGSOverlay.prototype = new google.maps.OverlayView();

// Initialize the map and the custom overlay.

function initializeCustomLayer(googleMap) {
  map = googleMap
  getWeatherInfos();
}

// after response with weather infos
dfd.done(function() {
  for(var i = 0; i < lng.length; i++) {
    var swBound = new google.maps.LatLng(lat[i], lng[i]);
    var neBound = new google.maps.LatLng(i, i);
    var bounds = new google.maps.LatLngBounds(swBound, neBound);

    // weather icon
    var srcImage = 'http://openweathermap.org/img/w/' + icon[i] + '.png';

    overlay = new USGSOverlay(bounds, srcImage, map);
  }
});

/** @constructor */
function USGSOverlay(bounds, image, map) {

  // Initialize all properties.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;
  // includes all data
  this.div_ = null;

  // set this overlay on map
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
USGSOverlay.prototype.onAdd = function() {

  var blabla = this.bounds_.getNorthEast();
  var memory = blabla.lng();

  var div_weather_info = document.createElement('div');
  div_weather_info.setAttribute("class", "div-weather-info");

  var div_weather_icon = document.createElement('div');
  div_weather_icon.setAttribute("class", "div-weather-icon");

  var div_wind_icon = document.createElement('div');
  div_wind_icon.setAttribute("class", "div-wind-icon" + memory);

  var div_weather_text = document.createElement('div');
  div_weather_text.setAttribute("class", "div-weather-text");

  var div_wind_text = document.createElement('div');
  div_wind_text.setAttribute("class", "div-wind-text");
  
  var img_weather_icon = document.createElement('img');
  img_weather_icon.setAttribute("src", this.image_);

  var txt_weather = document.createElement('text');
  txt_weather.innerHTML = temp[memory].toFixed(1) + "°C";

  var txt_wind = document.createElement('text');
  txt_wind.innerHTML = speed[memory] + "km/h";

  div_weather_text.appendChild(txt_weather);
  div_wind_text.appendChild(txt_wind);

  div_weather_icon.appendChild(img_weather_icon);
  

  div_weather_info.appendChild(div_weather_icon);
  div_weather_info.appendChild(div_wind_icon);
  div_weather_info.appendChild(div_weather_text);
  div_weather_info.appendChild(div_wind_text);

  this.div_ = div_weather_info;

  windIcon(deg[memory], memory);

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();
  // ??? Hier muss man schauen welche Schicht man will (MapPanes.mapPane,MapPanes.overlayLayer,MapPanes.overlayShadow,MapPanes.overlayImage,MapPanes.floatShadow,MapPanes.overlayMouseTarget,MapPanes.floatPane). Entscheidet was vorne oder weiter hinten liegt.
  panes.overlayLayer.appendChild(div_weather_info);
};

// set position of div
USGSOverlay.prototype.draw = function() {

  var blabla = this.bounds_.getNorthEast();
  var memory = blabla.lng();
  windIcon(deg[memory], memory);

  // needed to get position in pixel on map
  var overlayProjection = this.getProjection();

  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());

  // Resize the image's div to fit the indicated dimensions.
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = sw.y + 'px';
};


// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
USGSOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

//google.maps.event.addDomListener(window, 'load', initialize);


this.getWeatherInfos = function() {
  google.maps.event.addListener(map, 'idle', function(ev){
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    
    var url = "http://api.openweathermap.org/data/2.5/box/city?cluster=yes&cnt=200&format=json&units=metric&layer=%5Bobject%20Object%5D&bbox=";
    url += sw.lng() + ",";
    url += sw.lat() + ",";
    url += ne.lng() + ",";
    url += ne.lat() + ",";
    url += map.getZoom() + ",";
    url += "EPSG%3A4326&callback=OpenLayers.Protocol.Script.registry.c20";
    $.ajax({
        type: "POST",
        dataType: "jsonp",
        url: url,
        async: false,
        success: function (data) {
            for(var i = 0; i < data.list.length; i++) {
                speed[i] = data.list[i].wind.speed;
                deg[i] = data.list[i].wind.deg;
                icon[i] = data.list[i].weather[0].icon;
                temp[i] = data.list[i].main.temp;
                lng[i] = data.list[i].coord.lon;
                lat[i] = data.list[i].coord.lat;
            }
            dfd.resolve();
        },
        error: function (errorData) {
          alert("Error while getting weather data :: " + errorData.status);
        }
    });
  });
}


this.oldFunc = function() {
  var lngLat = map.getCenter();
  lng[0] = lngLat.lng();
  lat[0] = lngLat.lat();
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=";
  url += lat[0];
  url += "&lon=";
  url += lng[0];
  url += "&cnt=1";
  $.ajax({
    type: "POST",
    dataType: "json",
    url: url + "&callback=?",
    async: false,
    success: function (data) {
      speed[0] = data.wind.speed;
      deg[0] = data.wind.deg;
      icon[0] = data.weather[0].icon;
      // temperature is in Kelvin
      temp[0] = data.main.temp - 273,15;
      lng[0] = data.coord.lon;
      lat[0] = data.coord.lat;
      dfd.resolve();
    },
    error: function (errorData) {
      alert("Error while getting weather data :: " + errorData.status);
    }
  });
  //return dfd.promise();
}