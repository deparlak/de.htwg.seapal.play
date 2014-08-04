/**
 * menubar.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
!( function( window ) {
    menus = [];
    
    'use strict';

    // http://stackoverflow.com/a/11381730/989439
    function mobilecheck() {
        var check = false;
        (function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    }

    function menubar( id, options ) {    
        this.callbacks = {};
        this.callbacks.leftclick = {};
        this.callbacks.rightclick = {};
        this.onMenuCallbacks = {'open' : $.Callbacks(), 'close' : $.Callbacks()};
        this.el = document.getElementById( id );
        this.prefix = id;
        /* autoclose will close the menubar, if the user clicks on an area out of the menubar */
        this.autoclose = true;
        this._init();
        menus.push(this);
    }

    menubar.prototype = {
        /* method to add a a method to a special callback, like open, close the menubar */
        on : function (event, method) {
            if(undefined === this.onMenuCallbacks[event]) {
                throw("Cannot add callback, because event '"+event+"' does not exist.");  
            }
            this.onMenuCallbacks[event].add(method);
        },
        /* method will be added to callbacks list.
           All methods which are stored in a callback list, will be
           called if an hmtl object will be triggered which owns the
           class "action" and "<onClass>". 
        */
        addCallback : function (event, onClass, method) {
            if (Array.isArray(event)) {
                for (var i in event) {
                    this.addCallback(event[i], onClass, method);
                }
                return;
            }
            if (Array.isArray(onClass)) {
                for (var j in onClass) {
                    this.addCallback(event, onClass[j], method);
                }
                return;
            }
            if(undefined === this.callbacks[event]) {
                throw("Cannot add callback, because event '"+event+"' does not exist.");  
            }
            if (!this.callbacks[event][onClass]) {
                this.callbacks[event][onClass] = $.Callbacks();
            }
            this.callbacks[event][onClass].add(method);
        },  
        _closeSubmenus : function() {
            var self = this;
            $(".active-"+self.prefix+"-list").each(function( index ) {
                $(this).removeClass("active-"+self.prefix+"-list").addClass("inactive-"+self.prefix+"-list");
            });
        },
        _init : function() {
            this.trigger = this.el.querySelector( 'a.menubar-icon-'+this.prefix );
            this.menu = this.el.querySelector( 'nav.menubar-'+this.prefix+'-wrapper' );
            this.isMenuOpen = false;
            this.eventtype = mobilecheck() ? 'touchstart' : 'click';
            this._initEvents();

            var self = this;
            this.bodyClickFn = function() {
                if (self.autoclose) {
                    self.closeMenu();
                    this.removeEventListener( self.eventtype, self.bodyClickFn );
                }
            };
            /* add the built in calback for a 'link' marked element. Links can be used for multiple menu's */
            this.addCallback('leftclick', 'link', function (elem) {
                self._closeSubmenus();
                $("#"+elem.data("link")).removeClass("inactive-"+self.prefix+"-list").addClass("active-"+self.prefix+"-list");
            });
        },
        _initEvents : function() {
            var self = this;
            
            var action = function (event){
                event.stopPropagation();
                event.preventDefault();
                var classList = $(this).attr('class').split(/\s+/);
                
                /* there is no action or link to execute */
                if (-1 == classList.indexOf('action') && -1 == classList.indexOf('link')) {
                    return;
                }

                /* check which mouse button was clicked. */
                if (1 == event.which) {
                    var action = 'leftclick';
                }
                else if (3 == event.which) {
                    var action = 'rightclick';
                } else {
                    return;
                }
                for (var i in classList) {
                    if (self.callbacks[action][classList[i]]) {
                        self.callbacks[action][classList[i]].fire($(this));
                    }
                }
            };

            /* a element of the menu was clicked. Check if any callback has to be fired */
            $("#"+self.prefix+" > nav > div > ul > li").on( 'mousedown', 'a',  action);
            $("#"+self.prefix+" > nav > div > ul > li > div").on( 'mousedown', 'label',  action);
            $("#"+self.prefix+" > nav > div").on( 'mousedown', 'label',  action);
            $("#"+self.prefix+" > nav > div > ul > div").on( 'mousedown', 'li > a',  action);

            if( !mobilecheck() ) {
                this.trigger.addEventListener( 'mouseover', function(ev) { self.openIconMenu(); } );
                this.trigger.addEventListener( 'mouseout', function(ev) { self.closeIconMenu(); } );
            
                this.menu.addEventListener( 'mouseover', function(ev) {
                    self.openMenu(); 
                    document.addEventListener( self.eventtype, self.bodyClickFn ); 
                } );
            }
            this.trigger.addEventListener( this.eventtype, function( ev ) {
                ev.stopPropagation();
                ev.preventDefault();
                if( self.isMenuOpen ) {
                    self.closeMenu();
                    document.removeEventListener( self.eventtype, self.bodyClickFn );
                }
                else {
                    self.openMenu();
                    document.addEventListener( self.eventtype, self.bodyClickFn );
                }
            } );
            this.menu.addEventListener( this.eventtype, function(ev) { ev.stopPropagation(); } );
        },
        _closeOthers : function () {
            /* call the close method of each menu to be sure that only one menu is open */
            for (i=0; i< menus.length; i++) {
                /* close only other menus */
                if (menus[i] == this) {
                    continue;
                }
                menus[i].closeMenu();
            }
        },
        openIconMenu : function() {
            this._closeOthers();
            classie.add( this.menu, 'menubar-open-part' );
        },
        closeIconMenu : function() {
            classie.remove( this.menu, 'menubar-open-part' );
        },
        openMenu : function() {
            if( this.isMenuOpen ) return;
            this._closeOthers();
            classie.add( this.trigger, 'menubar-selected' );
            this.isMenuOpen = true;
            classie.add( this.menu, 'menubar-open-all' );
            this.closeIconMenu();
            this.onMenuCallbacks['open'].fire();
        },
        closeMenu : function() {
            if( !this.isMenuOpen ) return;
            this._closeSubmenus();
            $("#"+this.prefix+"-main").removeClass("inactive-"+this.prefix+"-list").addClass("active-"+this.prefix+"-list");
            classie.remove( this.trigger, 'menubar-selected' );
            this.isMenuOpen = false;
            classie.remove( this.menu, 'menubar-open-all' );
            this.closeIconMenu();
            this.onMenuCallbacks['close'].fire();
        },
        enableAutoClose : function() {
            this.autoclose = true;
        },
        disableAutoClose : function() {
            this.autoclose = false;
        }
    }

    // add to global namespace
    window.menubar = menubar;

} )( window );