/**
 * menu.js
 *
 * Define the actions for the tool entry's.
 * 
 */
 
$(function() {

//    tools = new menubar( document.getElementById( 'menubar-tools' ), 'tools' );

    tools.addCallback('icon-startLogging', function (self) {
        
        console.log('icon-startLogging');
    });
    
    tools.addCallback('icon-stopLogging', function (self) {
        
        console.log('icon-stopLogging');
    });
    
    tools.addCallback('icon-takePhoto', function (self) {
        
        console.log('icon-takePhoto');
    });
    
    tools.addCallback('icon-setMark', function (self) {
        
        console.log('icon-setMark');
    });  
    
    tools.addCallback('icon-setRoute', function (self) {
        
        console.log('icon-setRoute');
    });  
    
    tools.addCallback('icon-GetDistance', function (self) {
        
        console.log('icon-GetDistance');
    });  
    
    tools.addCallback('icon-PersonOverBoard', function (self) {
        
        console.log('icon-PersonOverBoard');
    });  
    
    tools.addCallback('icon-SecurityCircle', function (self) {
        
        console.log('icon-SecurityCircle');
    });  
    
    tools.addCallback('icon-NorthUp', function (self) {
        
        console.log('icon-NorthUp');
    });  
 
    tools.addCallback('icon-disableSleepMode', function (self) {
        
        console.log('icon-disableSleepMode');
    });

    tools.addCallback('icon-discardTarget', function (self) {
        
        console.log('icon-discardTarget');
    });    
});