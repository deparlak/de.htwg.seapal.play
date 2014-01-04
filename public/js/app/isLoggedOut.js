/**
 * isLoggedOut.js
 *
 * This javascript file will be used if a user is not logged in.
 * 
 */
 
$(document).ready(function() {    
	var a = 0;
	var b = 99;

    window.seamapSync =
    {
        create : function (type, obj, id) {
            console.log("create "+type);
            console.log("-----------------");
			console.log(id);
            console.log(obj);
			console.log(a);
			a++;
            console.log("-----------------");
        },
        remove : function (type, obj, id) {
            console.log("delete "+type);
            console.log("-----------------");
			console.log(id);
            console.log(obj);
			console.log(b);
			b++;
            console.log("-----------------");
        },
    };
});