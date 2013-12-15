/**
 * fullscreen.js
 *
 * API to switch with the Browser to Fullscreen and back to normal window mode.
 * 
 */
 
(function() {
    var 
        fullScreen = { 
            supportsFullScreen: false,
            isFullScreen: function() { return false; }, 
            requestFullScreen: function() {}, 
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
    
    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreen.supportsFullScreen = true;
    } else {     
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreen.prefix = browserPrefixes[i];
            
            if (typeof document[fullScreen.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreen.supportsFullScreen = true;
                
                break;
            }
        }
    }
    
    // update methods to do something useful
    if (fullScreen.supportsFullScreen) {
        fullScreen.fullScreenEventName = fullScreen.prefix + 'fullscreenchange';
        
        fullScreen.isFullScreen = function() {
            switch (this.prefix) {  
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreen.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreen.cancelFullScreen = function(el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }       
    }

    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function() {
    
            return this.each(function() {
                var el = jQuery(this);
                if (fullScreen.supportsFullScreen) {
                    fullScreen.requestFullScreen(el);
                }
            });
        };
    }

    // export api
    window.fullScreen = fullScreen;   
})();