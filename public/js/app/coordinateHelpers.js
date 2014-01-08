/**
 * handlebarHelpers.js
 *
 * Initialise the handlebar helpers
 * 
 */

$(document).ready(function() {
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
        
        return {
            LatLngToDecimal  :   LatLngToDecimal
        };
    }
    
    window.coordinateHelpers = coordinateHelpers;
});