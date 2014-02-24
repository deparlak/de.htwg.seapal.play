/**
 * logbook.js
 *
 * Define the actions for the logbook entry's.
 * 
 */

$(document).ready(function() {

    var active = "#account";
    var states = {normal : 0, remove : 1};
    var state = states.normal;
    var removeElements = {};
    var coord = new coordinateHelpers();

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
            map.remove(removeElements[i].data('type'), removeElements[i].data('id'));
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
    /* START-------------------------- person ------------------------------- */
    
    menu.addCallback('leftclick', 'icon-notSelectedPerson', function (self) {
        if (state == states.normal) {
            map.select(self.data('type'), self.data('id'));
        }
    });
    
    /* END-------------------------- person ------------------------------- */
   
    /* START-------------------------- boats ------------------------------- */
    var tmpBoat;

    menu.addCallback('leftclick', 'logbookBoatsAdd', function (self) {
        tmpBoat = map.getTemplate('boat');
        openBoatModal();
    });

    menu.addCallback('rightclick', ['icon-notSelected-boat', 'icon-selected-boat'], function (self) {
        menu.disableAutoClose();
        tmpBoat = map.get(self.data('type'), self.data('id'));
        openBoatModal();
    });

    $('#modal-form_boat').submit(function() {
        var boundData = Handlebars.getBoundData(tmpBoat);
        map.set('boat', boundData);
        $('#modal-form_boat').modal('hide');
        return false;
    });

    function openBoatModal() {
        var template = Handlebars.compile($("#boats_Template").text());
        var html = template(tmpBoat);

        $('#boatInputForm').html(html);
        menu.disableAutoClose();
        $('#modal-form_boat').modal('show');
    }
    /* END---------------------------- boats ------------------------------- */

    /* START-------------------------- marker ------------------------------- */
    var tmpMark = {
        "name"          : null,
        "position"      : null
    };

    var actMark;

    map.addCallback(events.EDIT_MARK, function (self) {
        createModal(self);
    });

    menu.addCallback('rightclick', ['icon-notSelected-mark', 'icon-selected-mark'], function (self) {
        createModal(map.get(self.data('type'), self.data('id')));
    });    

    $('#modal-form_marker').submit(function() {
        var boundData = Handlebars.getBoundData(tmpMark);
        var res = setToVal(boundData);

        if (res.error) {
            output.warning(res.error);
            $('#modal-form_marker').modal('hide');
            return false;
        }

        map.set('mark', actMark);
        $('#modal-form_marker').modal('hide');
        return false;
    });

    function createModal(object) {
        actMark = object;
        getFromVal(actMark);

        var template = Handlebars.compile($("#marker_Template").text());
        var html = template(tmpMark);

        $('#markerInputForm').html(html);
        $('#handlebar-id-position').inputmask({mask: "99°99.99' c 999°99.99' d", clearMaskOnLostFocus : false, clearIncomplete : false, autoUnmask : true });
        menu.disableAutoClose();
        $('#modal-form_marker').modal('show');
    }

    function getFromVal(marker) {
        tmpMark.name = marker.name;
        tmpMark.position = coord.getCoordinatesAsString(actMark.lat, actMark.lng);
    }

    function setToVal(marker) {
        actMark.name = marker.name;
        console.log(marker.position);
        var obj = coord.LatLngToDecimal(marker.position);
        
        if (obj.error) {
            return obj;
        }

        actMark.lat = obj.lat;
        actMark.lng = obj.lon;
        return obj;
    }
    /* END---------------------------- marker ------------------------------- */

    /* START-------------------------- route ------------------------------- */
    var tmpRoute;

    menu.addCallback('rightclick', ['icon-notSelected-route', 'icon-selected-route'], function (self) {        
        tmpRoute = map.get(self.data('type'), self.data('id'));
        var template = Handlebars.compile($("#route_Template").text());
        var html = template(tmpRoute);

        $('#routeInputForm').html(html);

        menu.disableAutoClose();
        $('#modal-form_route').modal('show');
    });

    $('#modal-form_route').submit(function() {
        var boundData = Handlebars.getBoundData(tmpRoute);
        console.log(boundData);
        map.set('route', boundData);
        $('#modal-form_route').modal('hide');
        return false;
    });
    /* END---------------------------- route ------------------------------- */

    /* START-------------------------- track and waypoint------------------------------- */
    var tmpTrack;
    var tmpWaypoint;

    map.addCallback(events.EDIT_WAYPOINT, function (self) {
        showEditWaypointModal(self.id);
    });

    menu.addCallback('leftclick', 'logbookTrackAdd', function (self) {        
        tmpTrack = map.getTemplate('trip');
        openTrackTripModal(tmpTrack);
    });
    
    menu.addCallback('rightclick', ['icon-notSelected-trip', 'icon-selected-trip'], function (self) {
        tmpTrack = map.get(self.data('type'), self.data('id'));
        tmpTrack.waypoint = map.getWaypoints(tmpTrack.id);
        openTrackTripModal(tmpTrack);
    });

    function openTrackTripModal(tmpTrack) {
        var template = Handlebars.compile($("#track_Template").text());
        var html = template(tmpTrack);
        $('#trackInputForm').html(html);

        menu.disableAutoClose();
        $('#modal-form_track').modal('show');

        // Initializes the datepicker
        $('.datepicker').datepicker();

        $("#track_WaypointList>table>tbody>tr").on('click', 'th', function() {
            showEditWaypointModal($(this).data('id'));
        });
    }

    function showEditWaypointModal(id) {
        tmpWaypoint = map.get('waypoint', id);
        tmpWaypoint.title = tmpWaypoint.name;
        tmpWaypoint.position = coord.getCoordinatesAsString(tmpWaypoint.lat, tmpWaypoint.lng);

        if(tmpWaypoint.image_thumb != null) {                       
            tmpWaypoint.image = "api/photo/"+tmpWaypoint._id+"/"+tmpWaypoint.type+".jpg";
        } else {
            tmpWaypoint.image = "/assets/images/no_image.png";
        }
        var template = Handlebars.compile($('#waypoint_Template').text());
        var html = template(tmpWaypoint);
        $('#waypointInputForm').html(html);            
        $('#modal-form_waypoint').modal('show');
    }

    $('#modal-form_waypoint').submit(function() {
        var boundData = Handlebars.getBoundData(tmpWaypoint);
        boundData.name = boundData.title;
        map.set('waypoint', boundData);
        $('#modal-form_waypoint').modal('hide');
        $("."+tmpWaypoint.type+tmpWaypoint.id).text(boundData.title);
        return false;
    });

    $('#modal-form_track').submit(function() {
        var boundData = Handlebars.getBoundData(tmpTrack);
        map.set('trip', boundData);
        $('#modal-form_track').modal('hide');
        return false;
    });
    /* END---------------------------- track and waypoint ------------------------------- */

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
    
    menu.addCallback('leftclick', ['icon-notSelected-trip', 'icon-notSelected-boat', 'icon-notSelected-person'], function (self) {
        if (state == states.normal) {
            map.select(self.data('type'), self.data('id'));
        } else if (state == states.remove) {
            selectToRemove(self);
        }
    });

    /*
     * On close methods of modals to enable the menu autohide again
     */
    $('#modal-form_track').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#trackInputForm').html("");
        }
    );
    $('#modal-form_waypoint').on('hidden.bs.modal',
        function() {
            $('#waypointInputForm').html("");
        }
    );
    $('#modal-form_marker').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#markerInputForm').html("");
        }
    );    
    $('#modal-form_route').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#routeInputForm').html("");
        }
    );
    $('#modal-form_boat').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#boatInputForm').html("");
        }
    );
    $('#modal-form_addCrewman').on('hidden.bs.modal',
        function() {
            menu.enableAutoClose();
            $('#email_addCrewman').val("");
        }
    );
});
