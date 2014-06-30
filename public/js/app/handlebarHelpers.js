/**
 * handlebarHelpers.js
 *
 * Initialise the handlebar helpers
 * 
 */

$(document).ready(function() {
    Handlebars.registerHelper("bindData", function(key) {
        return "id=handlebar-id-" + key;
    });

    Handlebars.getBoundData = function (obj, container) {
        if (typeof(container) === 'undefined') {
            container = 'body';
        }

        for ( property in obj ) {
            /* if there is no handlebar */
            var boundInputElement = $(container + ' #handlebar-id-' + property);
            if (boundInputElement.length == 0)
                continue;
            
            if (boundInputElement.attr('type') == 'number') {
                obj[property] = parseInt(boundInputElement.val());
            } else {
                obj[property] = boundInputElement.val();
            }

            if (boundInputElement.hasClass('datepicker')) {
                obj[property] = stringToDate(boundInputElement.val());
            }
        }
        return obj;
    };
    
    Handlebars.registerHelper('cutStringLength', function(string) {
        if (string.length > 20) {
            return string.substring(0, 20)+"...";
        }
        return string;
    });

    Handlebars.registerHelper('select', function( value, options ){
        var $el = $('<select />').html( options.fn(this) );
        if (value != '') {
        	$el.find('option[value=' + value + ']').attr({'selected':'selected'});
        }
        return $el.html();
    });
    
    Handlebars.registerHelper('getLat', function( geometry ){
        return geometry.location.lat();
    });

    Handlebars.registerHelper('getLng', function( geometry ){
        return geometry.location.lng();
    });

    Handlebars.registerHelper('dateToString', function(date) {
        var tmp = new Date(date);
        //return tmp.toLocaleDateString("de-DE");
        return moment(tmp).format(dateFormat + " " + timeFormat);
    });

    Handlebars.registerHelper('timeDateToString', function(date) {
        var tmp = new Date(date);
        var hour = tmp.getHours().toString().length < 2 ?  "0" + tmp.getHours() : tmp.getHours();
        var minute = tmp.getMinutes().toString().length < 2 ? "0" + tmp.getMinutes() : tmp.getMinutes();
        return tmp.toLocaleDateString("de-DE") + ", " + hour + ":" + minute;
    });

    function stringToDate(string) {
    	return moment(string, dateFormat + " " + timeFormat).toDate();
        //return new Date(string.substring(6,10), string.substring(3,5) -1, string.substring(0,2)).getTime();
    }
});
