/**
 * marksRoutesTracks.js
 *
 * Define the actions for the submenu marksRoutesTracks.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var active = "#marks";
    
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
        removeItem.disable();
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracksRemove', function (self) {
        removeItem.enable();
    });

    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
        /* disable remove item */
        removeItem.disable();
        self.button('toggle');
        $('.active-marksRoutesTracks').removeClass('active-marksRoutesTracks').addClass('inactive-marksRoutesTracks');
        $(self.data('name')).removeClass('inactive-marksRoutesTracks').addClass('active-marksRoutesTracks');
        /* set the search dialog with the latest searched keyword */
        lastSearch[active] = $('#search-marksRoutesTracks').val();
        active = self.data('name');
        $('#search-marksRoutesTracks').val(lastSearch[active]);
        /* be sure that the default footer is visible */
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    $("#search-marksRoutesTracks").keyup( function(event) {
        search(active, $('#search-marksRoutesTracks').val());
        event.stopPropagation();
        event.preventDefault();
    });
    
    /* handle leftclick events on a selected mark, route, trip,... */
    menu.addCallback('leftclick', ['icon-selected-mark', 'icon-selected-route', 'icon-selected-trip'], function (self) {
        if (removeItem.isEnabled()) {
            removeItem.select(self);
        } else {
            map.deselect(self.data('type'), self.data('id'));
        }
    });

    /* handle leftclick events on a not selected mark, route,... */
    menu.addCallback('leftclick', ['icon-notSelected-mark', 'icon-notSelected-route', 'icon-notSelected-trip'], function (self) {
        if (removeItem.isEnabled()) {
            removeItem.select(self);
        } else {
            map.select(self.data('type'), self.data('id'));
        }
    });
});