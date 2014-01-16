/**
 * logbook.js
 *
 * Define the actions for the logbook entry's.
 * 
 */

$(document).ready(function() {
    var active = "#account";
    var waypoint_headingTo_template = Handlebars.compile($("#waypoint_headingTo_option").html());
    var isWaypointModalToBeOpened = false;
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
    
    function selectToRemove(self) {
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
            map.remove(active.substring(1, active.length), removeElements[i].data('id'));
            removeElements[i].remove();
        }
        state = states.normal;
    };
    
    menu.addCallback('leftclick', 'logbookRemove', function (self) {
        $(active+"-footer").removeClass('visible').addClass('hidden');
        $('#logbookRemove-footer').removeClass('hidden').addClass('visible');
        state = states.remove;    
    });
    
    menu.addCallback('leftclick', 'logbookRemoveOk', function (self) {
        removeSelection();
        state = states.normal;
        $('#logbookRemove-footer').removeClass('visible').addClass('hidden');
        $(active+"-footer").removeClass('hidden').addClass('visible');
    });
    
    menu.addCallback('leftclick', 'logbookRemoveCancel', function (self) {
        initState();
        $('#logbookRemove-footer').removeClass('visible').addClass('hidden');
        $(active+"-footer").removeClass('hidden').addClass('visible');
    });
    
    /* when we open logbook submenu, we have to visible the footer for the submenu */
    menu.addCallback('leftclick', 'icon-logbook', function (self) {
        initState();
        $(active+"-footer").removeClass('hidden').addClass('visible'); 
    });
    
    /* when we swith one of the submenus */
    menu.addCallback('leftclick', 'logbook', function (self) {
        initState();
        self.button('toggle');
        $('.active-logbook').removeClass('active-logbook').addClass('inactive-logbook');
        $(self.data('name')).removeClass('inactive-logbook').addClass('active-logbook');
        /* hide the other footer and visible the now active */
        $(active+"-footer").removeClass('visible').addClass('hidden');
        active = self.data('name');
        $(active+"-footer").removeClass('hidden').addClass('visible'); 
        /* hide the remove footer */
        $('#logbookRemove-footer').removeClass('visible').addClass('hidden');
    });
    
    menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        console.log("TODO addCrew");
    });
   
    menu.addCallback('leftclick', 'logbookBoatsAdd', function (self) {
        console.log("TODO addBoat");
        boat = map.getTemplate('boat');
        map.set('boat', boat);
    });
    
    menu.addCallback('leftclick', 'icon-signInSeapal', function (self) {
        if(!map.checkTracking()) {
            return;
        }
        menu.closeMenu();
        window.location = "/login";
    });
    
    menu.addCallback('leftclick', 'icon-signUpSeapal', function (self) {
        if(!map.checkTracking()) {
            return;
        }
        menu.closeMenu();
        window.location = "/signup";
    });

    menu.addCallback('leftclick', 'icon-signOut', function (self) {
        if(!map.checkTracking()) {
            return;
        }
        menu.closeMenu();
        window.location = "/logout";
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedBoat', function (self) {
        if(!map.checkTracking() && state == states.normal) {
            return;
        }
        
        if (state == states.normal && self.hasClass('icon-notSelectedBoat')) {
            $('.icon-selectedBoat').removeClass('icon-selectedBoat').addClass('icon-notSelectedBoat');
            self.removeClass('icon-notSelectedBoat').addClass('icon-selectedBoat');
            map.selectBoat(self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });

    menu.addCallback('rightclick', ['icon-notSelectedBoat', 'icon-selectedBoat'], function (self) {
        if(!map.checkTracking()) {
            return;
        }
        menu.disableAutoClose();
        $('#modal-form_boat').modal('show');
    });

    menu.addCallback('rightclick', ['icon-notSelectedTrack', 'icon-selectedTrack'], function (self) {
        menu.disableAutoClose();
        $('#modal-form_track').modal('show');        
    });

    menu.addCallback('rightclick', ['icon-notSelectedRoute', 'icon-selectedRoute'], function (self) {
        menu.disableAutoClose();
        $('#modal-form_route').modal('show');        
    });

    menu.addCallback('rightclick', ['icon-notSelectedMark', 'icon-selectedMark'], function (self) {
        menu.disableAutoClose();
        $('#modal-form_marker').modal('show');
    });

    /**
     * Shows the waypoint modal and closes the parent track modal
     */
    $('#open_waypoint_modal').on('click',
        function() {
            if(!map.checkTracking()) {
                $('#modal-form_track').modal('hide');
                return;
            }
            isWaypointModalToBeOpened = true;
            $("#waypoint_headingTo_select").html(waypoint_headingTo_template(
                [{id:0, label:"-"}, {id:1, label:"Routepoint 1"}, {id:2, label:"Routepoint 2"}, {id:3, label:"Routepoint 3"}]));
            $('#modal-form_track').modal('hide');
            $('#modal-form_waypoint').modal('show');
        }
    );

    /**
     * Launches datepicker needed for the specific form(s)
     */
    $('.datepicker').datepicker();

    /*
     * On close methods of modals to enable the menu autohide again
     */
    $('#modal-form_track').on('hidden.bs.modal',
        function() {
            if(!isWaypointModalToBeOpened) {
                menu.enableAutoClose();
            }
        }
    );
    $('#modal-form_waypoint').on('hidden.bs.modal',
        function() {
            isWaypointModalToBeOpened = false;
            menu.enableAutoClose();
        }
    );
    $('#modal-form_marker').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
        }
    );    
    $('#modal-form_route').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
        }
    );
    $('#modal-form_boat').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
        }
    );
});
