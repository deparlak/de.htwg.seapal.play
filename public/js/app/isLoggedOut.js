/**
 * isLoggedOut.js
 *
 * This javascript file will be used if a user is not logged in.
 * 
 */
 
$(document).ready(function() {    

	menu.addCallback('leftclick', 'logbookCrewAdd', function (self) {
        output.warning("You are not logged in!");
    });

});