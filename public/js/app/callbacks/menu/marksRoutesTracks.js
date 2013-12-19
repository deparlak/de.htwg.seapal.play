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
        state = states.normal;
        $('#menu-marksRoutesTracks-footer').removeClass('hidden').addClass('visible');
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracksEdit', function (self) {
        state = states.edit;
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracksAdd', function (self) {
        state = states.add;
    });

    menu.addCallback('leftclick', 'marksRoutesTracksRemove', function (self) {
        state = states.remove;
    });
    
    menu.addCallback('leftclick', 'marksRoutesTracks', function (self) {
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
    
    menu.addCallback('leftclick', 'icon-selectedMark', function (self) {
        if (state == states.normal) {
            self.removeClass('icon-selectedMark').addClass('icon-notSelectedMark');
            map.hideMark(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit mark");
        } else if (state == states.remove) {
            console.log("TODO remove mark");
        }
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedMark', function (self) {
        if (state == states.normal) {
            self.removeClass('icon-notSelectedMark').addClass('icon-selectedMark');
            map.visibleMark(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit mark");
        } else if (state == states.remove) {
            console.log("TODO remove mark");
        }
    });
    
    menu.addCallback('leftclick', 'icon-selectedRoute', function (self) {
        if (state == states.normal) {
            self.removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            map.hideRoute(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit route");
        } else if (state == states.remove) {
            console.log("TODO remove route");
        }
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedRoute', function (self) {        
        if (state == states.normal) {
            $('.icon-selectedRoute').removeClass('icon-selectedRoute').addClass('icon-notSelectedRoute');
            self.removeClass('icon-notSelectedRoute').addClass('icon-selectedRoute');
            map.visibleRoute(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit route");
        } else if (state == states.remove) {
            console.log("TODO remove route");
        }
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedTrack', function (self) {   
        if (state == states.normal) {
            $('.icon-selectedTrack').removeClass('icon-SelectedTrack').addClass('icon-notSelectedTrack');
            self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
            map.visibleTrack(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit track");
        } else if (state == states.remove) {
            console.log("TODO remove track");
        }
    });
    
    menu.addCallback('leftclick', 'icon-selectedTrack', function (self) {
        if (state == states.normal) {
            self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
            map.hideTrack(self.data('id'));
        } else if (state == states.edit) {
            console.log("TODO edit track");
        } else if (state == states.remove) {
            console.log("TODO remove track");
        }
    });
});