/**
 * searchPosition.js
 *
 * Define the actions for the submenu searchPosition.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var history = {};
    var active = "#SearchPlaces";
    var method = {};
    var service = new google.maps.places.PlacesService(map.getGoogleMapsHandle());
    var geocoder = new google.maps.Geocoder();
    var templateSearchPlaces = Handlebars.compile($("#template-SearchPlaces").html());
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
        },
        'e': {
            validator: "-|\\+",
            cardinality: 1,
            casing: "upper"
        }
    });
    
    Handlebars.registerHelper('cutStringLength', function(string) {
        if (string.length > 20) {
            return string.substring(0, 20)+"...";
        }
        return string;
    });
    
    function addToHistory(search) {
        //history exist for this element
        if (history[active] === undefined){
            history[active] = [];
        }
        //element already in history
        if (-1 != history[active].indexOf(search)) {
            return;
        }
        //history over max
        if (history[active].length > 20) {
            history[active].pop();
        }
        //set new history entry to begin to show the latest searched things first.
        history[active].unshift(search);
    }
    
    function removeFromHistory(of) {
        //remove the last insert entry from the history.
        if (!(history[of] === undefined)){
            history[of].shift();
        }
    }
    
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
        if (latSec < 0 || latSec > 60 || isNaN(latSec)) {
            obj.error = "Lat sec should be in range of 0 to 60";
            return obj;
        }
        if (lonSec < 0 || lonSec > 60 || isNaN(lonSec)) {
            obj.error = "Lon sec should be in range of 0 to 60";
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
        obj.lat = latDegree + latMin * 0.6 + latSec * 0.36;
        obj.lon = lonDegree + lonMin * 0.6 + lonSec * 0.36;
        if ('W' == latDir) {
            obj.lat = -1 * obj.lat;
        }
        if ('S' == latDir) {
            obj.lon = -1 * obj.lon;
        }  
        return obj;
    }
    
    
    function renderCallback(div, results, status) {
        var render = {};
        render.status = {};
        render.status[status] = true;
        render[div.substring(1,99)] = results;
        
        //query was not ok, so remove the searched jquery from the history
        if (!render.status.OK) {
            removeFromHistory(div);
        }
        $(div).html(templateSearchPlaces(render));
    }
    
    function SearchPlacesCallback(results, status) {
        renderCallback("#SearchPlaces", results, status);
    }
    
    function SearchPOIsCallback(results, status) {
        renderCallback("#SearchPOIs", results, status);
    }
    
    function SearchCoordinatesCallback(results, status) {
        console.log(results);
        renderCallback("#SearchCoordinates", results, status);
    }
    
    method["#SearchPlaces"] = function(search) {
        addToHistory(search);
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPlacesCallback);
    };
      
    method["#SearchPOIs"] = function(search) {
        $(active).html(templateSearchPlaces({history : history[active], status : {SEARCHING_POIS : true}}));
    };
    
    method["#SearchCoordinates"] = function(search) {
        addToHistory(search);
        //check if position was complete typed in.
        if (!$("#search-searchPosition").inputmask("isComplete")) {
            $(active).html(templateSearchPlaces({status : {SEARCHING_COORDINATES_INCOMPLETE : true}}));
            return;
        }
        var obj = LatLngToDecimal(search);
        //check if an error occurred while parsing
        if (obj.error) {
            $(active).html(templateSearchPlaces(obj));
            return;
        }
        console.log(search);
        console.log(obj);
        var latlng = new google.maps.LatLng(obj.lat, obj.lon);
        geocoder.geocode({'latLng': latlng},SearchCoordinatesCallback);
    };

    tools.addCallback('leftclick', 'searchPosition', function (self) {
        self.button('toggle');
        $('.active-searchPosition').removeClass('active-searchPosition').addClass('inactive-searchPosition');
        $(self.data('name')).removeClass('inactive-searchPosition').addClass('active-searchPosition');
        
        lastSearch[active] = $('#search-searchPosition').val();
        $('#search-searchPosition').val("");
        active = self.data('name');
        
        if (active != "#SearchCoordinates") {
            $('#search-searchPosition').inputmask('remove');        
        } else {
            $('#search-searchPosition').inputmask({mask: "99°99.99' c 999°99.99' d"});
        }        
        /* unfocus and focus because the search input was modified before */
        //$('#search-searchPosition').blur();
        //$('#search-searchPosition').focus();
        $('#search-searchPosition').val(lastSearch[active]);
    });
    
    $("#search-searchPosition").keydown( function(event) {
        //SearchPlaces/SearchCoordinates/SearchPOI will only search after hitting enter, because the Search method has a quota which will be reached too fast
        if ( event.which == 13 || active == "#SearchMarks") {
            var search = "";
            search += $('#search-searchPosition').val();
            if (search.length > 0) {
                method[active](search);
//                $('#search-searchPosition').blur();
            }
        //if we search not for marks, we will display a message that the search is in action.
        } else if (active == "#SearchPlaces") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_PLACES : true}}));
        } else if (active == "#SearchCoordinates") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_COORDINATES : true}}));
        } else if (active == "#SearchPOIs") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_POIS : true}}));
        }
    }); 
    
    //callback for a selection of a history entry
    tools.addCallback('leftclick', 'icon-previousSearch', function (self) {
        $('#search-searchPosition').val(self.data('search'));
        method[self.data('type')](self.data('search'));
    });
});
