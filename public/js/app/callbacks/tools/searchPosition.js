/**
 * searchPosition.js
 *
 * Define the actions for the submenu searchPosition.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var history = {};
    var method = {};
    var service = new google.maps.places.PlacesService(map.getGoogleMapsHandle());
    var geocoder = new google.maps.Geocoder();
    var templateSearchPlaces = Handlebars.compile($("#template-SearchPlaces").html());
    var active = "#SearchPOIs";
    var coord = new coordinateHelpers();
    displaySearchInfos();
    active = "#SearchCoordinates";
    displaySearchInfos();
    active = "#SearchPlaces";
    displaySearchInfos();
        
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
        //set new history entries to begin to show the latest searched things first.
        history[active].unshift(search);
    }
    
    function removeFromHistory(of) {
        //remove the last insert entries from the history.
        if (!(history[of] === undefined)){
            history[of].shift();
        }
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
        $(div).append(templateSearchPlaces(render));
    }
    
    function SearchPlacesCallback(results, status) {
        renderCallback("#SearchPlaces", results, status);
    }
    
    function SearchPOIsCallback(results, status) {
        renderCallback("#SearchPOIs", results, status);
    }
    
    function SearchCoordinatesCallback(results, status) {
        renderCallback("#SearchCoordinates", results, status);
    }
    
    function displaySearchInfos() {
        if (active == "#SearchPlaces") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_PLACES : true}}));
        } else if (active == "#SearchCoordinates") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_COORDINATES : true}}));
        } else if (active == "#SearchPOIs") {
            $(active).html(templateSearchPlaces({type : active, history : history[active], status : {SEARCHING_POIS : true}}));
        }
    }
    
    method["#SearchPlaces"] = function(search) {
        $("#SearchPlaces").html("");
        addToHistory(search);
        var request = {
            bounds: map.getGoogleMapsHandle().getBounds(),
            query: search
        };
        service.textSearch(request, SearchPlacesCallback);
    };
      
    method["#SearchPOIs"] = function(search) {
        $("#SearchPOIs").html("");
        $(active).html(templateSearchPlaces({history : history[active], status : {SEARCHING_POIS : true}}));
    };
    
    method["#SearchCoordinates"] = function(search) {
        addToHistory(search);
        //check if position was complete typed in.
        if (!$("#search-searchPosition").inputmask("isComplete")) {
            $(active).html(templateSearchPlaces({status : {SEARCHING_COORDINATES_INCOMPLETE : true}}));
            return;
        }
        var obj = coord.LatLngToDecimal(search);
        //check if an error occurred while parsing
        if (obj.error) {
            $(active).html(templateSearchPlaces(obj));
            return;
        }
        $("#SearchCoordinates").html(templateSearchPlaces({name : search, coord : obj, status : {PLACES_COORDINATE : true}}));
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
            $('#search-searchPosition').val(lastSearch[active]);            
        } else {
            $('#search-searchPosition').val(lastSearch[active]);
            $('#search-searchPosition').inputmask({mask: "99°99.99' c 999°99.99' d", clearMaskOnLostFocus : false, clearIncomplete : false, autoUnmask : true });
        }
        /* blur and focus again, to avoid that the inputmask will not be displayed immediately */
        $('#search-searchPosition').blur();
        $('#search-searchPosition').focus();
    });
    
    $("#search-searchPosition").keydown( function(event) {
        //SearchPlaces/SearchCoordinates/SearchPOI will only search after hitting enter, because the Search method has a quota which will be reached too fast
        if ( event.which == 13) {
            var search = "";
            search += $('#search-searchPosition').val();
            if (search.length > 0) {
                method[active](search);
            }
        } else {
            displaySearchInfos();
        }
    }); 
    
    /* callback for a selection of a history entries */
    tools.addCallback('leftclick', 'icon-previousSearch', function (self) {
        if (active == "#SearchCoordinates") {
            $('#search-searchPosition').inputmask('remove');
            $('#search-searchPosition').val(self.data('search'));
            $('#search-searchPosition').inputmask({mask: "99°99.99' c 999°99.99' d", clearMaskOnLostFocus : false, clearIncomplete : false, autoUnmask : true });
        } else {
            $('#search-searchPosition').val(self.data('search'));
        }
        method[self.data('type')](self.data('search'));
    });
    
    /* callback to search at actual position */
    tools.addCallback('leftclick', 'icon-actualPositionSearch', function (self) {
        var pos = map.getCurrentBoatInformation();
        pos = pos.latStr+" "+pos.lngStr;
        $('#search-searchPosition').inputmask('remove');
        $('#search-searchPosition').val(pos);
        $('#search-searchPosition').inputmask({mask: "99°99.99' c 999°99.99' d", clearMaskOnLostFocus : false, clearIncomplete : false, autoUnmask : true });
        method["#SearchCoordinates"](pos);
    });
    
    /* callback to display a searched place */
    tools.addCallback('leftclick', 'icon-searchedPlace', function (self) {
        map.setTemporaryMark(new google.maps.LatLng(self.data('lat'), self.data('lng')));
    });
    
    /* callback to display a searched coordinate */
    tools.addCallback('leftclick', 'icon-searchedCoordinate', function (self) {
        map.setTemporaryMark(new google.maps.LatLng(self.data('lat'), self.data('lng')));
    });
});
