/**
 * marksRoutesTracks.js
 *
 * Define the actions for the submenu marksRoutesTracks.
 * 
 */
 
$(document).ready(function() {    
    var lastSearch = {};
    var active = "#marks";
    var states = {normal : 0, edit : 1, add : 2, remove : 3};
    var state = states.normal;
    var removeElements = {};

    /* calling initState will clear the list of items which shall be removed and set the state back to normal */
    initState = function (){
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
        console.log("start remove");
        for (var i in removeElements) {
            console.log("remove "+i);
        }
        state = states.normal;
    };
    
    search = function(inElement, search) {
        console.log(inElement);
        console.log(search);
        $(inElement+" li").each(function(index) {
            console.log($(this));
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
    
    menu.addCallback('leftclick', 'marksRoutesTracksAdd', function (self) {
        state = states.add;
    });

    menu.addCallback('leftclick', 'marksRoutesTracksRemove', function (self) {
        if (state == states.remove) {
            removeSelection();
        } else {
            state = states.remove;
        }
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
        state = states.normal;
        self.button('toggle');
        $('.active-marksRoutesTracks').removeClass('active-marksRoutesTracks').addClass('inactive-marksRoutesTracks');
        $(self.data('name')).removeClass('inactive-marksRoutesTracks').addClass('active-marksRoutesTracks');
        
        lastSearch[active] = $('#search-marksRoutesTracks').val();
        active = self.data('name');
        $('#search-marksRoutesTracks').val(lastSearch[active]);  
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
        if (state == states.normal && self.hasClass('icon-selectedRoute')) {
            self.removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            map.hideRoute(self.data('id'));
        } else if (state == states.normal && self.hasClass('icon-notSelectedRoute')) {
            $('.icon-selectedRoute').removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            self.removeClass('icon-notSelectedRoute').addClass('icon-selectedRoute');
            map.visibleRoute(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit route");
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });
    
    /* handle leftclick events on a track */
    menu.addCallback('leftclick', ['icon-selectedTrack', 'icon-notSelectedTrack'], function (self) {   
        if (state == states.normal && self.hasClass('icon-notSelectedTrack')) {
            $('.icon-selectedTrack').removeClass('icon-SelectedTrack').addClass('icon-notSelectedTrack');
            self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
            map.visibleTrack(self.data('id'));
        } else if (state == states.normal && self.hasClass('icon-selectedTrack')) {
            self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            map.hideTrack(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit track");
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });
});