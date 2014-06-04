// container which contains all weather info from openweathermap
var weatherData;
var sw;
var ne;

var overlay;
var map;

var listener;

USGSOverlay.prototype = new google.maps.OverlayView();

function destroyCustomLayer() {
  google.maps.event.removeListener(listener);
  if (overlay != null) {
    overlay.setMap(null);
  }
}

// Initialize the map and the custom overlay.
function initializeCustomLayer(googleMap) {
  map = googleMap;
  overlay = null;
  listener = null;
  weatherData = new Array();

  getWeatherInfos();

  // listener which is called by any change of the map (move in one direction or zoom in and out)
  listener = google.maps.event.addListener(map, 'idle', function(ev){
    weatherData = new Array();
    getWeatherInfos();
  });
}

/** @constructor */
function USGSOverlay(bounds, image, map) {

  // Initialize all properties.
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;
  // keep all weather data of the layer
  this.div_ = null;

  // set this overlay on map
  this.setMap(map);
}

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
USGSOverlay.prototype.onAdd = function() {
  var weatherHTML = new Array();

  // div over total layout, get size in pixel
  var overlayProjection = this.getProjection();
  sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
  var pixelWidth = ne.x - sw.x;
  var pixelHeight = sw.y - ne.y;

  // This div is like an overlayer
  var div_weather_layer = document.createElement('div');
  div_weather_layer.setAttribute("class", "div-weather-layer");
  div_weather_layer.style.width = pixelWidth + "px";
  div_weather_layer.style.height = pixelHeight + "px";
    
  for(var i = 0; i < weatherData.length; i++) {
    weatherHTML[i] = new Array();

    // get position of weather info in pixel
    weatherHTML[i]["swBound"] = new google.maps.LatLng(weatherData[i]["lat"], weatherData[i]["lng"]);

    var pointInPixel = getPixelPosition(weatherHTML[i]["swBound"]);

    weatherHTML[i]["swDiv"] = overlayProjection.fromLatLngToDivPixel(weatherHTML[i]["swBound"]);

    if (checkClosestInfo(weatherHTML[i]["swDiv"])) {
      weatherData[i]["drawn"] = weatherHTML[i]["swDiv"];
    } else {
      continue;
    }

    weatherHTML[i]["div_weather_info"] = document.createElement('div');
    weatherHTML[i]["div_weather_info"].setAttribute("class", "div-weather-info");
    weatherHTML[i]["div_weather_info"].style.left = (pointInPixel.x - 25) + 'px';
    weatherHTML[i]["div_weather_info"].style.top = (pointInPixel.y - 75) + 'px';

    weatherHTML[i]["div_weather_icon"] = document.createElement('div');
    weatherHTML[i]["div_weather_icon"].setAttribute("class", "div-weather-icon");

    weatherHTML[i]["div_wind_icon"] = document.createElement('div');
    weatherHTML[i]["div_wind_icon"].setAttribute("class", "div-wind-icon");
    weatherHTML[i]["div_wind_icon"].setAttribute("id", "div-wind-icon" + i);

    weatherHTML[i]["div_weather_text"] = document.createElement('div');
    weatherHTML[i]["div_weather_text"].setAttribute("class", "div-weather-text");

    weatherHTML[i]["div_wind_speed"] = document.createElement('div');
    weatherHTML[i]["div_wind_speed"].setAttribute("class", "div-wind-speed");

    weatherHTML[i]["div_wind_deg"] = document.createElement('div');
    weatherHTML[i]["div_wind_deg"].setAttribute("class", "div-wind-deg");
    
    weatherHTML[i]["img_weather_icon"] = document.createElement('img');
    weatherHTML[i]["img_weather_icon"].setAttribute("src", "http://openweathermap.org/img/w/" + weatherData[i]["icon"] + ".png");

    weatherHTML[i]["txt_weather"] = document.createElement('text');
    weatherHTML[i]["txt_weather"].setAttribute("class", "text-weather-info");
    if (weatherData[i]["temp"]) {
      weatherHTML[i]["txt_weather"].innerHTML = weatherData[i]["temp"].toFixed(1) + "°C";
    } else {
      weatherHTML[i]["txt_weather"].innerHTML = "NA" + "°C";
    }

    weatherHTML[i]["txt_wind_speed"] = document.createElement('text');
    weatherHTML[i]["txt_wind_speed"].setAttribute("class", "text-weather-info");
    if (weatherData[i]["speed"]) {
      weatherHTML[i]["txt_wind_speed"].innerHTML = weatherData[i]["speed"].toFixed(1) + "m/s";
    } else {
      weatherHTML[i]["txt_wind_speed"].innerHTML = "NA" + "m/s";
    }

    weatherHTML[i]["txt_wind_deg"] = document.createElement('text');
    weatherHTML[i]["txt_wind_deg"].setAttribute("class", "text-weather-info");
    if (weatherData[i]["deg"]) {
      weatherHTML[i]["txt_wind_deg"].innerHTML = weatherData[i]["deg"].toFixed(1) + "°";
    } else {
      weatherHTML[i]["txt_wind_deg"].innerHTML = "NA" + "°";
    }

    weatherHTML[i]["div_weather_text"].appendChild(weatherHTML[i]["txt_weather"]);
    weatherHTML[i]["div_wind_speed"].appendChild(weatherHTML[i]["txt_wind_speed"]);
    weatherHTML[i]["div_wind_deg"].appendChild(weatherHTML[i]["txt_wind_deg"]);
    weatherHTML[i]["div_weather_icon"].appendChild(weatherHTML[i]["img_weather_icon"]);

    weatherHTML[i]["div_weather_info"].appendChild(weatherHTML[i]["div_weather_icon"]);
    weatherHTML[i]["div_weather_info"].appendChild(weatherHTML[i]["div_wind_icon"]);
    weatherHTML[i]["div_weather_info"].appendChild(weatherHTML[i]["div_weather_text"]);
    weatherHTML[i]["div_weather_info"].appendChild(weatherHTML[i]["div_wind_speed"]);
    weatherHTML[i]["div_weather_info"].appendChild(weatherHTML[i]["div_wind_deg"]);

    div_weather_layer.appendChild(weatherHTML[i]["div_weather_info"]);
  }

  this.div_ = div_weather_layer;

  // Add the element to the "overlayLayer" pane.
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div_weather_layer);
};

// set position of div
USGSOverlay.prototype.draw = function() {

  for(var i = 0; i < weatherData.length; i++) {
    if(weatherData[i]["drawn"].x != 0) {
      windIcon(weatherData[i]["deg"], weatherData[i]["speed"], i);
    }
  }

  // Resize the image's div to fit in the indicated dimensions.
  var div = this.div_;
  div.style.left = sw.x + 'px';
  div.style.top = ne.y + 'px';
};


// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
USGSOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

// ajax request at openweathermap.org. Get weather data from an area.
this.getWeatherInfos = function() {
  
  // destroy old overlay
  if (overlay != null) {
    overlay.setMap(null);
  }

  var bounds = map.getBounds();
  var nePoint = bounds.getNorthEast();
  var swPoint = bounds.getSouthWest();
  
  var url = "http://api.openweathermap.org/data/2.5/box/city?cluster=yes&cnt=200&format=json&units=metric&layer=%5Bobject%20Object%5D&bbox=";
  url += swPoint.lng() + ",";
  url += swPoint.lat() + ",";
  url += nePoint.lng() + ",";
  url += nePoint.lat() + ",";
  url += map.getZoom() + ",";
  url += "EPSG%3A4326&callback=OpenLayers.Protocol.Script.registry.c20";
  $.ajax({
      type: "POST",
      dataType: "jsonp",
      url: url,
      async: true,
      success: function (data) {
          for(var i = 0; i < data.list.length; i++) {
              weatherData[i] = new Array();
              weatherData[i]["speed"] = data.list[i].wind.speed;
              weatherData[i]["deg"] = data.list[i].wind.deg;
              weatherData[i]["icon"] = data.list[i].weather[0].icon;
              weatherData[i]["temp"] = data.list[i].main.temp;
              weatherData[i]["place"] = data.list[i].name;
              weatherData[i]["lng"] = data.list[i].coord.lon;
              weatherData[i]["lat"] = data.list[i].coord.lat;
              weatherData[i]["drawn"] = new google.maps.Point(0, 0);
          }
      },
      error: function (errorData) {
        alert("Error while getting weather data :: " + errorData.status);
        if (overlay != null) {
          overlay.setMap(null);
        }
      }
  }).done(function() {
    // ??? Vielleicht Bounds von Request verwenden
    var bounds = map.getBounds();
    overlay = new USGSOverlay(bounds, null, map);
  });
}

// check if there is a shown weather info closer than 150 pixel on the map
function checkClosestInfo(point) {
  for(var i = 0; i < weatherData.length; i++) {
    if(weatherData[i]["drawn"].x != 0) {
      math = Math.round(Math.sqrt(Math.pow(point.y - weatherData[i]["drawn"].y, 2) + Math.pow(point.x - weatherData[i]["drawn"].x, 2)));
      if(math < 150) {
        return false;
      }
    }
  }
  return true;
}

// returns the offset between the current map position and the position of a wetherstation station
function getPixelPosition(point) {
  var scale = Math.pow(2, map.getZoom());
  var nw = new google.maps.LatLng(map.getBounds().getNorthEast().lat(), map.getBounds().getSouthWest().lng());
  var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
  var worldCoordinate = map.getProjection().fromLatLngToPoint(point);
  var pixelOffset = new google.maps.Point(Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale), Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale));
 
  return pixelOffset;
}