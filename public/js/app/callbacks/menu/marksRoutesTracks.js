/**
 * marksRoutesTracks.js
 *
 * Define the actions for the submenu marksRoutesTracks.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var active = "#marks";
    var states = {normal : 0, remove : 1};
    var state = states.normal;
    var removeElements = {};

    /* calling initState will clear the list of items which shall be removed and set the state back to normal */
    function initState(){
        for (var i in removeElements) {
            removeElements[i].removeClass('remove');
        }
        removeElements = {};
        state = states.normal;
    };
    
    function selectToRemove (self) {
        if (self.hasClass('remove')) {
            self.removeClass('remove');
            delete removeElements[self.data('id')];
        } else {
            self.addClass('remove');
            removeElements[self.data('id')] = self;
        }
    };
    
    function removeSelection() {
        for (var i in removeElements) {
            map.remove(removeElements[i].data('type'), removeElements[i].data('id'));
        }
		/* selection removed, go back to init state */
        removeElements = {};
        state = states.normal;
    };
    
    function search(inElement, search) {
        $(inElement+" li").each(function(index) {
            //does not match search criterium, so hide this element
            if (-1 == $(this).text().indexOf(search)) {
                $(this).removeClass("visible").addClass("hidden");
            } else {
                $(this).removeClass("hidden").addClass("visible");
            }
        });
    };
    /* when we open marksRoutesTracks submenu, we have to visible the footer for the submenu */
    menu.addCallback('leftclick', 'icon-marksRoutesTracks', function (self) {
        initState();
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracksRemoveOk', function (self) {
        removeSelection();
        state = states.normal;
        $('#menu-marksRoutesTracksRemove-footer').removeClass('visible').addClass('hidden');
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracksRemoveCancel', function (self) {
        initState();
        $('#menu-marksRoutesTracksRemove-footer').removeClass('visible').addClass('hidden');
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });

    menu.addCallback('leftclick', 'marksRoutesTracksRemove', function (self) {
        $('#menu-marksRoutesTracks-footer').removeClass('visible').addClass('hidden');
        $('#menu-marksRoutesTracksRemove-footer').removeClass('hidden').addClass('visible');
        state = states.remove;    
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
        initState();
        self.button('toggle');
        $('.active-marksRoutesTracks').removeClass('active-marksRoutesTracks').addClass('inactive-marksRoutesTracks');
        $(self.data('name')).removeClass('inactive-marksRoutesTracks').addClass('active-marksRoutesTracks');
        /* set the search dialog with the latest searched keyword */
        lastSearch[active] = $('#search-marksRoutesTracks').val();
        active = self.data('name');
        $('#search-marksRoutesTracks').val(lastSearch[active]);
        /* be sure that the default footer is visible */
        $('.menu-footer').removeClass('visible').addClass('hidden');
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    $("#search-marksRoutesTracks").keyup( function(event) {
        search(active, $('#search-marksRoutesTracks').val());
        event.stopPropagation();
        event.preventDefault();
    });
    
    /* handle leftclick events on a selected mark, route, trip,... */
    menu.addCallback('leftclick', ['icon-selected-mark', 'icon-selected-route', 'icon-selected-trip'], function (self) {
        if (state == states.normal) {
            map.deselect(self.data('type'), self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });

    /* handle leftclick events on a not selected mark, route, trip,... */
    menu.addCallback('leftclick', ['icon-notSelected-mark', 'icon-notSelected-route', 'icon-notSelected-trip'], function (self) {
        if (state == states.normal) {
            map.select(self.data('type'), self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });
});