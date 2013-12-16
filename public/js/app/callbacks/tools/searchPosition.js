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
    var templateSearchPlaces = Handlebars.compile($("#template-SearchPlaces").html());
    
    Handlebars.registerHelper('cutStringLength', function(string) {
        if (string.length > 20) {
            return string.substring(0, 20)+"...";
        }
        return string;
    });
    
    method["#SearchPlaces"] = function(search) {
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPlacesCallback);
    };
   
    function SearchPlacesCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            results = {status : {ZERO_RESULTS : true}};
        } else if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            results = {status : {OVER_QUERY_LIMIT : true}};
        } else if (status == google.maps.places.PlacesServiceStatus.OK) {
            //everything ok with the result
        } else {
            results = {status : {UNKNOWN_ERROR : true}};
        }
        //console.log(results);
        $("#SearchPlaces").html(templateSearchPlaces(results));
    }
    
    method["#SearchMarks"] = function(search) {
        console.log("Search in marks "+search);
    };
    
    method["#SearchCoordinates"] = function(search) {
        console.log("Search in Coordinates "+search);
    };

    tools.addCallback('leftclick', 'searchPosition', function (self) {
        self.button('toggle');
        $('.active-searchPosition').removeClass('active-searchPosition').addClass('inactive-searchPosition');
        $(self.data('name')).removeClass('inactive-searchPosition').addClass('active-searchPosition');
        
        lastSearch[active] = $('#search-searchPosition').val();
        active = self.data('name');
        $('#search-searchPosition').val(lastSearch[active]);  
    });
    
    $("#search-searchPosition").keydown( function(event) {
        //SearchPlaces will only search after hitting enter, because the Search method has a quota which will be reached too fast
        if ( event.which == 13 || active != "#SearchPlaces") {
            var search = "";
            search += $('#search-searchPosition').val();
            if (search.length > 0) {
                method[active](search);
                event.stopPropagation();
                event.preventDefault();
            }
        //if we search for places, we will display a message that the search is in action.
        } else if (active == "#SearchPlaces") {
            $("#SearchPlaces").html(templateSearchPlaces({status : {SEARCHING : true}}));
        }
    }); 
});