/**
 * marksRoutesTracks.js
 *
 * Define the actions for the submenu marksRoutesTracks.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var active = "#marks";
    var states = {normal : 0, edit : 1, remove : 2};
    var state = states.normal;
    var removeElements = {};

    /* calling initState will clear the list of items which shall be removed and set the state back to normal */
    initState = function (){
        for (var i in removeElements) {
            removeElements[i].removeClass('remove');
        }
        removeElements = {};
        state = states.normal;
    };
    
    selectToRemove = function (self) {
        if (self.hasClass('remove')) {
            self.removeClass('remove');
            delete removeElements[self.data('id')];
        } else {
            self.addClass('remove');
            removeElements[self.data('id')] = self;
        }
    };
    
    removeSelection = function () {
        for (var i in removeElements) {
            map.remove(active.substring(1, active.length), removeElements[i].data('id'));
            removeElements[i].remove();
        }
        state = states.normal;
    };
    
    search = function(inElement, search) {
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
    
    menu.addCallback('leftclick', 'marksRoutesTracksEdit', function (self) {
        state = states.edit;
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
    
    /* handle leftclick events on a mark */
    menu.addCallback('leftclick', ['icon-selectedMark', 'icon-notSelectedMark'], function (self) {
        if (state == states.normal && self.hasClass('icon-selectedMark')) {
            self.removeClass('icon-selectedMark').addClass('icon-notSelectedMark');
            map.hideMark(self.data('id'));
        } else if (state == states.normal && self.hasClass('icon-notSelectedMark')) {
            self.removeClass('icon-notSelectedMark').addClass('icon-selectedMark');
            map.visibleMark(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit mark");
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });

    /* handle leftclick events on a route */ 
    menu.addCallback('leftclick', ['icon-selectedRoute', 'icon-notSelectedRoute'], function (self) {
        if(!map.checkTracking() && state == states.normal) {
            return;
        }
        if (state == states.normal && self.hasClass('icon-selectedRoute')) {
            self.removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            map.hideRoute(self.data('id'));
        } else if (state == states.normal && self.hasClass('icon-notSelectedRoute')) {
            $('.icon-selectedRoute').removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            self.removeClass('icon-notSelectedRoute').addClass('icon-selectedRoute');
            map.visibleRoute(self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });

    /* handle leftclick events on a track */ 
    menu.addCallback('leftclick', ['icon-selectedTrack', 'icon-notSelectedTrack'], function (self) {
        if(!map.checkTracking() && state == states.normal) {
            return;
        }
        if (state == states.normal && self.hasClass('icon-selectedTrack')) {
            self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            map.hideTrack(self.data('id'));
        } else if (state == states.normal && self.hasClass('icon-notSelectedTrack')) {
            $('.icon-selectedTrack').removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
            map.visibleTrack(self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });
});