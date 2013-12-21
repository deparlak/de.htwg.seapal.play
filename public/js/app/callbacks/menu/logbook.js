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

    /* when we open logbook submenu, we have to visible the footer for the submenu */
    menu.addCallback('leftclick', 'icon-logbook', function (self) {
        $(active+"-footer").removeClass('hidden').addClass('visible'); 
    });
    
    /* when we swith one of the submenus */
    menu.addCallback('leftclick', 'logbook', function (self) {
        self.button('toggle');
        $('.active-logbook').removeClass('active-logbook').addClass('inactive-logbook');
        $(self.data('name')).removeClass('inactive-logbook').addClass('active-logbook');
        /* hide the other footer and visible the now active */
        $(active+"-footer").removeClass('visible').addClass('hidden');
        active = self.data('name');
        $(active+"-footer").removeClass('hidden').addClass('visible'); 
    });
    
    menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        console.log("TODO addCrew");
    });
   
    menu.addCallback('leftclick', 'logbookBoatsAdd', function (self) {
        console.log("TODO addBoat");
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
    
    menu.addCallback('leftclick', 'icon-notSelectedBoat', function (self) {
        if(!map.checkTracking()) {
            return;
        }
        $('.icon-selectedBoat').removeClass('icon-selectedBoat').addClass('icon-notSelectedBoat');
        self.removeClass('icon-notSelectedBoat').addClass('icon-selectedBoat');
        map.selectBoat(self.data('id'));
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
    $('#modal-form_boat').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
        }
    );
});
