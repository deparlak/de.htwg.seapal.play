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
	    dataURL[1] = takeAsImageFile();
		return dataURL;
	}

	/* Disables the video stream */
	camera.disable_camera = function() {
		if(video != null) {
			video.pause();
			video_stream.stop();
		}
	}

	/* convert base64 to raw binary data held in a string. Doesn't handle URLEncoded DataURIs */
    function dataURItoBlob(dataURI, callback) {

        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = unescape(dataURI.split(',')[1]);
        }

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        window.URL = window.URL || window.webkitURL;
        var blob = new Blob([ab], { type: mimeString });

        return blob;
    }

   function getAsJPEGBlob(canvas) {
        if(canvas.mozGetAsFile) {
            return canvas.mozGetAsFile("foo.jpg", "image/jpeg");
        } else {
            var data = canvas.toDataURL('image/jpeg', 1.0);
            var blob = dataURItoBlob(data);
            return blob;
        }
    }

	function takeAsImageFile() {
		var canvas = document.createElement('canvas');
	    canvas.id = 'hiddenCanvas';
	    //add canvas to the body element
	    var ctx = canvas.getContext('2d');
	    canvas.width = video.videoWidth;
	    canvas.height = video.videoHeight;
	    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

	    return getAsJPEGBlob(canvas);
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