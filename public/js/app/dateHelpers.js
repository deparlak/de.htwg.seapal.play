/**
 * dateHelper.js
 *
 * Initialise the date helpers
 * 
 */

$(document).ready(function() {

    function dateHelpers() {
        
        /* Returns the time difference between to date objects with the format hh:mm:ss */
        function getDateDifference(start, end) {
            var duration = end - start;
            var seconds = parseInt((duration / 1000)) % 60;
            var minutes = parseInt((duration / (1000 * 60))) % 60;
            var hours = parseInt(duration / (1000 * 60 * 60));
            return numericExtend(hours, 2) + ":" + 
                   numericExtend(minutes, 2) + ":" +
                   numericExtend(seconds, 2);
        }    
                
        return {
            getDateDifference : getDateDifference
        };
    }
    
    window.dateHelpers = dateHelpers;

    /* Extends the value with zeros given by extend */
    function numericExtend(value, extend) {
        var len = value.toString().length;
        if(len >= extend) {
            return value;
        } else {
            var tmp = "";
            var diff = extend - len;
            for(var i = 0; i < diff; i++) {
                tmp += "0";
            }
            return tmp + value;
        }
    }

});