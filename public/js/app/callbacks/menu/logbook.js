/**
 * logbook.js
 *
 * Define the actions for the logbook entry's.
 * 
 */

$(document).ready(function() {
    var waypoint_headingTo_template = Handlebars.compile($("#waypoint_headingTo_option").html());

    menu.addCallback('leftclick', 'logbook', function (self) {
        self.button('toggle');
        $('.active-logbook').removeClass('active-logbook').addClass('inactive-logbook');
        $(self.data('name')).removeClass('inactive-logbook').addClass('active-logbook');
        console.log(self.data('name'));
    });
    
    menu.addCallback('leftclick', 'icon-selectedTrack', function (self) {
        self.removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        console.log(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedTrack', function (self) {
        $('.icon-selectedTrack').removeClass('icon-selectedTrack').addClass('icon-notSelectedTrack');
        self.removeClass('icon-notSelectedTrack').addClass('icon-selectedTrack');
        console.log(self.data('id'));
    });
    
    menu.addCallback('leftclick', 'icon-signInSeapal', function (self) {
        menu.closeMenu();
        window.location = "/login";
    });
    
    menu.addCallback('leftclick', 'icon-signUpSeapal', function (self) {
        menu.closeMenu();
        window.location = "/signup";
    });
    
    menu.addCallback('leftclick', 'icon-notSelectedBoat', function (self) {
        $('.icon-selectedBoat').removeClass('icon-selectedBoat').addClass('icon-notSelectedBoat');
        self.removeClass('icon-notSelectedBoat').addClass('icon-selectedBoat');
        map.selectBoat(self.data('id'));
    });  

    menu.addCallback('rightclick', ['icon-notSelectedBoat', 'icon-selectedBoat'], function (self) {
        $('#modal-form_boat').modal('show');
    });

    menu.addCallback('rightclick', ['icon-notSelectedTrack', 'icon-selectedTrack'], function (self) {
        $('#modal-form_track').modal('show');
    });

    menu.addCallback('rightclick', ['icon-notSelectedMark', 'icon-selectedMark'], function (self) {
        $('#modal-form_marker').modal('show');
    });

    /**
     * Shows the waypoint modal and closes the parent track modal
     */
    $('#open_waypoint_modal').on('click',
        function showWaypointModal() {
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
});
