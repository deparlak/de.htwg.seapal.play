/**
 * marksRoutesTracks.js
 *
 * Define the actions for the submenu marksRoutesTracks.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var active = "#marks";
    var method = {};
    
    
    method["#marks"] = function(search) {
        console.log("Search in marks "+search);
    };
    
    method["#routes"] = function(search) {
        console.log("Search in routes "+search);
    };
    
    method["#tracks"] = function(search) {
        console.log("Search in tracks "+search);
    };

    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
        self.button('toggle');
        $('.active-marksRoutesTracks').removeClass('active-marksRoutesTracks').addClass('inactive-marksRoutesTracks');
        $(self.data('name')).removeClass('inactive-marksRoutesTracks').addClass('active-marksRoutesTracks');
        
        lastSearch[active] = $('#search-marksRoutesTracks').val();
        active = self.data('name');
        $('#search-marksRoutesTracks').val(lastSearch[active]);  
    });
    
    $("#search-marksRoutesTracks").keyup( function(event) {
        method[active]($('#search-marksRoutesTracks').val());
        event.stopPropagation();
        event.preventDefault();
    });
});