/**
 * handlebarHelpers.js
 *
 * Initialise the handlebar helpers
 * 
 */

$(document).ready(function() {
    if (typeof($.inputmask) != "undefined") {    
	    //extend the input mask plugin to be able to input N which is North and S which is South for latitude and WE (West and East) for longitude.
	    $.extend($.inputmask.defaults.definitions, {
	        'c': { 
	            validator: "N|S",
	            cardinality: 1,
	            casing: "upper"
	        },
	        'd': {
	            validator: "W|E",
	            cardinality: 1,
	            casing: "upper"
	        }
	    });
    };
    
    function coordinateHelpers() {
        function LatLngToDecimal(string) {
            var obj = {};
            if (24 != string.length) {
                obj.error = "Lat Lng input has a not correct length.";
                return obj;
            }
            var latDegree = parseInt(string.substring(0, 2));
            var latMin = parseInt(string.substring(3, 5));
            var latSec = parseInt(string.substring(6, 8));
            var latDir = string.substring(10, 11);
            var lonDegree = parseInt(string.substring(12, 15));
            var lonMin = parseInt(string.substring(16, 18));
            var lonSec = parseInt(string.substring(19, 21));
            var lonDir = string.substring(23, 24);

            if (latDegree < 0 || latDegree > 90 || isNaN(latDegree)) {
                obj.error = "Lat degree should be in range of 0 to 90";
                return obj;
            }
            if (lonDegree < 0 || lonDegree > 180 || isNaN(lonDegree)) {
                obj.error = "Lon degree should be in range of 0 to 180";
                return obj;
            }
            if (latMin < 0 || latMin > 60 || isNaN(latMin)) {
                obj.error = "Lat min should be in range of 0 to 60";
                return obj;
            }
            if (lonMin < 0 || lonMin > 60 || isNaN(lonMin)) {
                obj.error = "Lon min should be in range of 0 to 60";
                return obj;
            }
            if (latSec < 0 || latSec > 99 || isNaN(latSec)) {
                obj.error = "Lat min.xx should be in range of 0 to 99";
                return obj;
            }
            if (lonSec < 0 || lonSec > 99 || isNaN(lonSec)) {
                obj.error = "Lon min.xx should be in range of 0 to 99";
                return obj;
            }
            if (latDir != 'N' && latDir != 'S') {
                obj.error = "Lat Direction has to be 'N' or 'S'.";
                return obj;
            }
            if (lonDir != 'W' && lonDir != 'E') {
                obj.error = "Lon Direction has to be 'W' or 'E'.";
                return obj;
            }
            obj.lat = latDegree + ((latMin + (latSec / 100)) / 60);
            obj.lon = lonDegree + ((lonMin + (lonSec / 100)) / 60);
            if ('W' == latDir) {
                obj.lat = -1 * obj.lat;
            }
            if ('S' == latDir) {
                obj.lon = -1 * obj.lon;
            }  
            return obj;
        }

        /* Gets the current coordinates in a human readable format */
        function getCoordinatesAsString(lat, lng) {
            return toLatLngString(lat, "lat") + " " + toLatLngString(lng, "lng");
        }
        
        /* Gets the latatude coordinate in a human readable format */
        function getLatAsString(lat) {
        	return toLatLngString(lat, "lat");
        }
        
        /* Gets the longitude coordinate in a human readable format */
        function getLngAsString(lng) {
        	return toLatLngString(lng, "lng");
        }
                
        return {
            LatLngToDecimal  :   LatLngToDecimal,
            getCoordinatesAsString : getCoordinatesAsString,
            getLatAsString : getLatAsString,
            getLngAsString : getLngAsString
        };
    }
    /* Gets the current coordinates in a human readable format array for use in the specific forms */
    function toLatLngArray(dms, type) {
        var sign = 1, Abs=0;
        var days, minutes, direction;
        var result = new Array();

        if(dms < 0) {
            sign = -1;
        }

        Abs = Math.abs( Math.round(dms * 1000000.));
        days = Math.floor(Abs / 1000000);
        minutes = (((Abs/1000000) - days) * 60).toFixed(2);
        days = days * sign;

        if(type == 'lat') {
            direction = days<0 ? 'S' : 'N';
        }

        if(type == 'lng') {
            direction = days<0 ? 'W' : 'E';
        }

        result[0] = (days * sign);
        result[1] = minutes.length == 4 ? "0" + minutes : minutes;
        result[2] = direction;
        
        return result;
    }
    /* Gets the current coordinates in a human readable format in a complete string*/
    function toLatLngString(dms, type) {
        var tmp = toLatLngArray(dms, type);
        var deg = tmp[0].toString();

        if(type == 'lat') {
            if(deg.length == 1) {
                deg = "0" + deg;
            }
        } else if(type == 'lng') {
            if(deg.length == 1) {
                deg = "00" + deg;
            } else if(deg.length == 2) {
                deg = "0" + deg;
            }
        }
        return deg + '°' + tmp[1] + "' " + tmp[2];
    }
    
    window.coordinateHelpers = coordinateHelpers;
});