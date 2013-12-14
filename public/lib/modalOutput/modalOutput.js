!( function( window ) {

    function modalOutput( modal, title, body) {    
        this.beforeCallbacks = $.Callbacks();
        this.modal = $("#"+modal);
        this.title = $("#"+title);
        this.body = $("#"+body);
    }

    modalOutput.prototype = {
        /* Add a callback method which will be called before the output will be displayed. */
        before : function (method) {
            this.beforeCallbacks.add(method);
        },  
        error : function (msg) {
            this.beforeCallbacks.fire();
            title.html("Error");
            $(this.body).html(msg);
            $(this.modal).modal('show');
        }, 
        warning : function (msg) {
            this.beforeCallbacks.fire();
            $(this.title).html("Warning");
            $(this.body).html(msg);
            $(this.modal).modal('show');
        },
        info : function (msg) {
            this.beforeCallbacks.fire();
            this.title.html("Information");
            this.body.html(msg);
            this.modal.modal('show');
        },
    }

    // add to global namespace
    window.modalOutput = modalOutput;

} )( window );