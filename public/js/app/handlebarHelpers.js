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
            if ($('#handlebar-id-'+property).attr('type') == 'number') {
                obj[property] = parseInt($('#handlebar-id-'+property).val());
            } else {
                obj[property] = $('#handlebar-id-'+property).val();
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
});