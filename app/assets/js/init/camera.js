/**
 * camera.js
 *
 * Define the actions for the camera.
 * 
 */

(function() {
	var cameraApi = {
            setup: function() {},
            captureImage: function() {},
            dataURL: ''
        };

	var video;

	cameraApi.setup = function() {
		console.log("SETUP");
	    navigator.myGetMedia = (navigator.getUserMedia ||
	    navigator.webkitGetUserMedia ||
	    navigator.mozGetUserMedia ||
	    navigator.msGetUserMedia);
	    navigator.myGetMedia({ video: true }, connect, error);
	}

	function connect(stream) {
		console.log("CONNECT");
	    video = document.getElementById("photo-video");
	    video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
	    video.play();
	}

	function error(e) { 
		console.log(e);
		document.getElementById("photo-button").disabled = true;
		alert(e);
	}

	cameraApi.captureImage = function() {
		console.log("CAPTURE");
	    var canvas = document.createElement('canvas');
	    canvas.id = 'hiddenCanvas';
	    //add canvas to the body element
	    document.body.appendChild(canvas);
	    //add canvas to #canvasHolder
	    document.getElementById('canvasHolder').appendChild(canvas);
	    var ctx = canvas.getContext('2d');
	    canvas.width = video.videoWidth / 4;
	    canvas.height = video.videoHeight / 4;
	    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	    //save canvas image as data url
	    dataURL = canvas.toDataURL();
	    console.log(dataURL);
		if(video != null) { video.pause(); }
	}

	var el = document.getElementById("photo-button");
	if(el != null) {
	    el.addEventListener("click", function() {        
	        window.cameraApi.captureImage();
	        map.setImageMark(self);
	    }, false)
	}

	window.cameraApi = cameraApi;
})();