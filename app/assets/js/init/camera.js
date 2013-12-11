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
            disable_camera: function() {}
        };

    var dataURL;
	var video;
	var video_stream;

	cameraApi.setup = function() {
	    navigator.myGetMedia = (navigator.getUserMedia ||
	    navigator.webkitGetUserMedia ||
	    navigator.mozGetUserMedia ||
	    navigator.msGetUserMedia);
	    navigator.myGetMedia({ video: true }, connect, error);
	}

	cameraApi.captureImage = function() {
	    var canvas = document.createElement('canvas');
	    canvas.id = 'hiddenCanvas';
	    //add canvas to the body element
	    var ctx = canvas.getContext('2d');
	    canvas.width = video.videoWidth;
	    canvas.height = video.videoHeight;
	    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	    //save canvas image as data url
	    dataURL = canvas.toDataURL();

		return dataURL;
	}

	cameraApi.disable_camera = function() {
		if(video != null) {
			video.pause();
			video_stream.stop();
		}
	}

	function connect(stream) {
		video_stream = stream;
	    video = document.getElementById("photo-video");
	    video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
	    video.play();
	}

	function error(e) { 
		console.log(e);
		document.getElementById("photo-button").disabled = true;
		alert(e);
	}

	window.cameraApi = cameraApi;
})();