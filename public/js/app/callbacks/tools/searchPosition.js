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
    
    method["#SearchPlaces"] = function(search) {
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPlacesCallback);
    };
   
    function SearchPlacesCallback(results, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
            alert(status);
            return;
        }
        console.log(results);
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
        if ( event.which == 13 ) {
            method[active]($('#search-searchPosition').val());
            event.stopPropagation();
            event.preventDefault();
        }
    }); 
});