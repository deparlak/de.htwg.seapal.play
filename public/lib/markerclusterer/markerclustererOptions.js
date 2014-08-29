!( function( window ) {
    options = 
    {
        minimumClusterSize : 2,

        calculator : function (markers, numStyles) {
            var index = 0;
            var title = "";
            var count = 0;
            // run thorugh all markers and check if the marker has a _summarized property, which should
            // tell us that the marker summarizes X markers.
            for (var i = 0; i < markers.length; i++) {
                if (markers[i]._summarized !== undefined) {
                 //   console.log("summarized"+markers[i]._summarized);
                    count += markers[i]._summarized;
                } else {
                    count += 1;
                }
            }
            
            count = count.toString();
            var dv = count;
            console.log("calculator called");
            
            while (dv !== 0) {
                dv = parseInt(dv / 10, 10);
                index++;
            }

            index = Math.min(index, numStyles);
            return {
                text: count,
                index: index,
                title: title
                };
            }
    
    
    };

    // add to global namespace
    window.markerclustererOptions = options;
} )( window );