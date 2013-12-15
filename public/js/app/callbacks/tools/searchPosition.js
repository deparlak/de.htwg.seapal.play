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
    
    
    method["#SearchPlaces"] = function(search) {
        console.log("Search in places "+search);
    };
    
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
    
    $("#search-searchPosition").keyup( function(event) {
        method[active]($('#search-searchPosition').val());
        event.stopPropagation();
        event.preventDefault();
    }); 
});