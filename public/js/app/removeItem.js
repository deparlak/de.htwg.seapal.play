/**
 * removeItem.js
 *
 * handle items from the menu which are removable.
 * 
 */
$(document).ready(function() {
    menu.addCallback('leftclick', 'removeItemOk', function (self) {
        removeItem.removeSelection();
    });

    menu.addCallback('leftclick', 'removeItemCancel', function (self) {
        removeItem.disable();
    });
});
 
var removeItem = (function () {    
        var enabled = false;
        var removeElements = {};
        /**
        * *************************************************************************************
        * public methods
        * *************************************************************************************
        */
        /* Clear the list of items which shall be removed and set the state back to normal */
        function disable(){
            for (var i in removeElements) {
                removeElements[i].removeClass('remove');
            }
            removeElements = {};
            enabled = false;
            $('#removeItem-footer').removeClass('visible').addClass('hidden');
        };
        
        /* Clear the list of items which shall be removed and set the state back to normal */
        function enable(){
            enabled = true;
            $('#removeItem-footer').removeClass('hidden').addClass('visible');
        };
        
        function isEnabled(){
            return enabled;
        };
        
        /* toggle a item to remove */
        function select (self) {
            if (self.hasClass('remove')) {
                self.removeClass('remove');
                delete removeElements[self.data('id')];
            } else {
                self.addClass('remove');
                removeElements[self.data('id')] = self;
            }
        };
        
        /* remove the selected items */
        function removeSelection() {
            for (var i in removeElements) {
                map.remove(removeElements[i].data('type'), removeElements[i].data('id'));
            }
            /* selection removed, go back to init state */
            removeElements = {};
            enabled = false;
            $('#removeItem-footer').removeClass('visible').addClass('hidden');
        };

        return {
            disable         :   disable,
            enable          :   enable,
            select          :   select,
            removeSelection :   removeSelection,
            isEnabled       :   isEnabled
        };
})();