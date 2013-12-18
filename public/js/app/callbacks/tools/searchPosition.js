/**
 * searchPosition.js
 *
 * Define the actions for the submenu searchPosition.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
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
    
    function renderCallback(div, results, status) {
        var render = {};
        render.status = {};
        render.status[status] = true;
        render[div.substring(1,99)] = results;
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
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPlacesCallback);
    };
      
    method["#SearchPOIs"] = function(search) {
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPOIsCallback);
    };
    
    method["#SearchCoordinates"] = function(search) {
        //check if position was complete typed in.
        if (!$("#search-searchPosition").inputmask("isComplete")) {
            $(active).html(templateSearchPlaces({status : {SEARCHING_COORDINATES_INCOMPLETE : true}}));
            return;
        }
        var latlng = new google.maps.LatLng(40.730885,-73.997383);
        geocoder.geocode({'latLng': latlng},SearchCoordinatesCallback);
    };

    tools.addCallback('leftclick', 'searchPosition', function (self) {
        self.button('toggle');
        $('.active-searchPosition').removeClass('active-searchPosition').addClass('inactive-searchPosition');
        $(self.data('name')).removeClass('inactive-searchPosition').addClass('active-searchPosition');
        
        lastSearch[active] = $('#search-searchPosition').val();
        $('#search-searchPosition').val("");
        active = self.data('name');
        
        console.log(active);
        console.log(lastSearch);
        if (active != "#SearchCoordinates") {
            $('#search-searchPosition').inputmask('remove');        
        } else {
            $('#search-searchPosition').inputmask({mask: "99°99.99' c 999°99.99' d"});
        }        
        $('#search-searchPosition').val(lastSearch[active]);
        /* unfocus and focus because the search input was modified before */
        $('#search-searchPosition').blur();
        $('#search-searchPosition').focus();
    });
    
    $("#search-searchPosition").keydown( function(event) {
        //SearchPlaces/SearchCoordinates/SearchPOI will only search after hitting enter, because the Search method has a quota which will be reached too fast
        if ( event.which == 13 || active == "#SearchMarks") {
            var search = "";
            search += $('#search-searchPosition').val();
            if (search.length > 0) {
                method[active](search);
                $('#search-searchPosition').blur();
            }
        //if we search not for marks, we will display a message that the search is in action.
        } else if (active == "#SearchPlaces") {
            $(active).html(templateSearchPlaces({status : {SEARCHING_PLACES : true}}));
        } else if (active == "#SearchCoordinates") {
            $(active).html(templateSearchPlaces({status : {SEARCHING_COORDINATES : true}}));
        } else if (active == "#SearchPOIs") {
            $(active).html(templateSearchPlaces({status : {SEARCHING_POIS : true}}));
        }
    }); 
});
