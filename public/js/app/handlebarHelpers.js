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

    Handlebars.getBoundData = function(obj) {
        for ( property in obj ) {
            /* if there is no handlebar */
            if (null == document.getElementById('handlebar-id-'+property)) {
                continue;
            }
            
            if ($('#handlebar-id-'+property).attr('type') == 'number') {
                obj[property] = parseInt($('#handlebar-id-'+property).val());
            } else {
                obj[property] = $('#handlebar-id-'+property).val();
            }

            if ($('#handlebar-id-'+property).hasClass('datepicker')) {
                obj[property] = stringToDate($('#handlebar-id-'+property).val());
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
        $el.find('[value=' + value + ']').attr({'selected':'selected'});
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
        return tmp.toLocaleDateString("de-DE");
    });

    Handlebars.registerHelper('timeDateToString', function(date) {
        var tmp = new Date(date);
        var hour = tmp.getHours().toString().length < 2 ?  "0" + tmp.getHours() : tmp.getHours();
        var minute = tmp.getMinutes().toString().length < 2 ? "0" + tmp.getMinutes() : tmp.getMinutes();
        return tmp.toLocaleDateString("de-DE") + ", " + hour + ":" + minute;
    });

    function stringToDate(string) {
        return new Date(string.substring(6,10), string.substring(3,5) -1, string.substring(0,2)).getTime();
    }
});
