/**
 * camera.js
 *
 * API to access the camera and take a photo.
 * 
 */

(function() {

	var camera = {
            setup: function(video, button) {},
            captureImage: function() {},
            disable_camera: function() {}
        };

    var dataURL = new Array();
	var video;
	var video_stream;
	var video_id;
	var button_id;

	/* Initializes the video stream and checks user permission for open video */
	camera.setup = function(video, button) {
		video_id = video;
		button_id = button;
		document.getElementById(button_id).disabled = true;
	    navigator.myGetMedia = (navigator.getUserMedia ||
	    navigator.webkitGetUserMedia ||
	    navigator.mozGetUserMedia ||
	    navigator.msGetUserMedia);
	    navigator.myGetMedia({ video: true }, connect, error);
	}

	/* Capture an image and returns it BASE64 encoded */
	camera.captureImage = function() {
	    dataURL[0] = takePhoto(20, 20);
	    dataURL[1] = takeImage(210, 157);
		return dataURL;
	}

	/* Disables the video stream */
	camera.disable_camera = function() {
		if(video != null) {
			video.pause();
			video_stream.stop();
		}
	}

	function takeImage(width, height) {
		var canvas = document.createElement('canvas');
	    canvas.id = 'hiddenCanvas';
	    //add canvas to the body element
	    var ctx = canvas.getContext('2d');
	    canvas.width = width;
	    canvas.height = height;
	    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	    return canvas.toDataURL();
	}

	/* Takes the photo and scales it by the given factors*/
	function takePhoto(scaleFactorX, scaleFactorY) {
		var canvas = document.createElement('canvas');
	    canvas.id = 'hiddenCanvas';
	    //add canvas to the body element
	    var ctx = canvas.getContext('2d');
	    canvas.width = video.videoWidth / scaleFactorX;
	    canvas.height = video.videoHeight / scaleFactorY;
	    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	    return canvas.toDataURL();
	}

	/* Connects to the camera (callback of function setup) */
	function connect(stream) {
		video_stream = stream;
	    video = document.getElementById(video_id);
	    video.src = window.URL ? window.URL.createObjectURL(stream) : stream;
	    video.play();
	    document.getElementById(button_id).disabled = false;
	}

	/* Error handling (callback of function setup) */
	function error(e) {
		document.getElementById(button_id).disabled = true;
	}

	window.camera = camera;
})();