/**
 * onloaded.js
 *
 * Called when page is loaded
 * 
 */

$(document).ready(function() {
    window.onload = function(){
        if(navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Firefox") != -1) {
            return;
        }
        output.warning("We are very sorry but the browser you are currently using does not support all of the technologies needed by this web app!" + 
                       " If you continue you may experience some errors. Please use either one of the following browsers: Firefox, Chrome, Opera!" + 
                       " Thank you for your understanding!");
    };
});