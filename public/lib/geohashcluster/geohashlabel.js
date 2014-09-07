/**
 * Display markers as styled markers. The idea is based on MarkerClustererPlus for Google Maps V3. But the
 * difference is that the clustering should already be done, before setting the data to the map. The
 * Clustering therefore run on the server.
 * This configuration is based on the "MarkerClustererPlus for Google Maps V3 version 2.1.1 [November 4, 2013]".
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 !( function( window ) {
    // helper function to build the default options, based on the "MarkerClustererPlus for Google Maps V3." markers
    var getOptions = function (opt) {
        // unless which count value the chosen style should be used.
        maxCount = [10,25,50,100,100000];
        return {
            maxCount            : maxCount[parseInt(opt.index) - 1],
            url                 : "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclustererplus/images/m" + opt.index + ".png",
            height              : opt.height,
            width               : opt.width,
            anchorText          : [0, 0],
            anchorIcon          : [parseInt(opt.height / 2, 10), parseInt(opt.width / 2, 10)],
            textColor           : "black",
            textSize            : 11,
            textDecoration      : "none",
            fontWeight          : "bold",
            fontStyle           : "normal",
            fontFamily          : "Arial,sans-serif",
            backgroundPosition  : "0 0"
        };
    };

    // set default styles with the 5 different sizes which  "MarkerClustererPlus for Google Maps V3." provides.
    defaultStyles = [];
    for (var i in (sizes = [53, 56, 66, 78, 90])) {
        var opt = {index : parseInt(i) + 1, width : sizes[i], height : sizes[i]};
        defaultStyles.push(getOptions(opt));
    }

    // Constructor for GeohashLabel
    function GeohashLabel (options) {
        var self = this;
        if (!options) return new Error("Options are required. e.g. GeohashLabel({...})");
        if (!options.map) return new Error("options.map required! This should be the handle to google map.");
        if (!options.LatLng) return new Error("options.LatLng required!");
        if (!options.styles) options.styles =  jQuery.extend(true, [], defaultStyles);
        if (!options.text) options.text = options.count.toString();
        // create a div, which will contain the label
        self.div = document.createElement('div');
        self.div.style.cssText = 'position: absolute; display: none';
        // store the options
        self.options = options;
        // set this to map
        this.setMap(options.map);
        
        // select the style, depending on the input parameters.
        self.selectStyle = function () {
            // choose the index for the chosen style
            var index = 0;
            for (var index; index < self.options.styles.length; index++) {
                if (self.options.count < self.options.styles[index].maxCount) {
                    break;
                }
            }
            // calculate the style to use.
            self.style = self.options.styles[index];
            console.log("SELECT STYLE : "+self.style.maxCount);
        };
        
        // method which should be called to set the image to the correct position.
        self.redrawPosition = function () {
            var pos = self.getProjection().fromLatLngToDivPixel(self.options.LatLng);
            pos.x -= self.style.anchorIcon[1];
            pos.y -= self.style.anchorIcon[0];
            pos.x = parseInt(pos.x, 10);
            pos.y = parseInt(pos.y, 10);
            var style = "cursor: pointer;";
            style += "position: absolute; top: " + pos.y + "px; left: " + pos.x + "px;";
            style += "width: " + self.style.width + "px; height: " + self.style.height + "px";
            self.div.style.cssText = style;
        };
        
        // style innerHTML
        self.drawDiv = function () {
            self.selectStyle();
            // create the image tag
            img = "<img src='" + self.style.url + "' style='position: absolute; top: 0px; left: 0px;'>";
            self.div.innerHTML = "";
            // create the inner html
            self.div.innerHTML = img + "<div style='" +
                "position: absolute;" +
                "top: " + self.style.anchorText[0] + "px;" +
                "left: " + self.style.anchorText[1] + "px;" +
                "color: " + self.style.textColor + ";" +
                "font-size: " + self.style.textSize + "px;" +
                "font-family: " + self.style.fontFamily + ";" +
                "font-weight: " + self.style.fontWeight + ";" +
                "font-style: " + self.style.fontStyle + ";" +
                "text-decoration: " + self.style.textDecoration + ";" +
                "text-align: center;" +
                "width: " + self.style.width + "px;" +
                "line-height:" + self.style.height + "px;" +
                "'>" + self.options.text + "</div>";
            // visible the div
            self.div.style.display = "";
        };
    };

    GeohashLabel.prototype = new google.maps.OverlayView;


    GeohashLabel.prototype.visible = function () {
        this.div.style.display = "";
    }
    
    GeohashLabel.prototype.hide = function () {
        this.div.style.display = "none";
    }
    
    GeohashLabel.prototype.remove = function () {
        this.setMap(null);
    }
    
    GeohashLabel.prototype.update = function (options) {
        var self = this;
        if (!options) return new Error("options  parameter is required. e.g. GeohashLabel.update({...})");
        if (!options.count) return new Error("options.count is required on GeohashLabel.update({...})");
        self.options.count = options.count;
        if (!options.text) self.options.text = options.count.toString();
        
        // redraw div
        self.drawDiv();
    }
    
    // Implement onAdd
    GeohashLabel.prototype.onAdd = function () {
        var self = this;
        // style the div, depending to the actual data.
        self.drawDiv();
        // add to pane
        var pane = this.getPanes().overlayLayer;
        pane.appendChild(self.div);
        // add listeners
        this.listeners = [
            google.maps.event.addListener(this, 'position_changed',
            function() { self.draw(); }),
            google.maps.event.addListener(this, 'text_changed',
            function() { self.draw(); })
        ];
    };

    // Implement onRemove
    GeohashLabel.prototype.onRemove = function() {
        console.log("onRemove");
        var self = this;
        // remove div
        self.div.parentNode.removeChild(self.div );
        // remove listeners
        for (var i = 0, I = self.listeners.length; i < I; ++i) {
            google.maps.event.removeListener(self.listeners[i]);
        }
    };

    // Implement draw
    GeohashLabel.prototype.draw = function () {
        if ('none' != this.div.style.display) {
            this.redrawPosition();
        }
    };

    // add to global namespace
    window.GeohashLabel = GeohashLabel;

} )( window );