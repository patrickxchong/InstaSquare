/*****
Bytutorial.com - online community to share articles for web and mobile programming and designers.
Author: Andy Suwandy

NOTE: Please change the CLIENT ID by creating your own app in google.
In order to work in your local computer, please change the client ID in the code and set the url of where the google drive app will be loaded.
otherwise you should get an error message saying the url you try to load does not match.
****/

/******************** GLOBAL VARIABLES ********************/
var SCOPES = ['https://www.googleapis.com/auth/drive.file', 'profile'];
var CLIENT_ID = '440020782887-1rsqas8u0rkldf67hluinf08rg2m3f3a.apps.googleusercontent.com';
var FOLDER_NAME = "";
var FOLDER_ID = "root";
var FOLDER_PERMISSION = true;
var FOLDER_LEVEL = 0;
var NO_OF_FILES = 1000;
var DRIVE_FILES = [];

/******************** AUTHENTICATION ********************/

function init() {
	// Load the API client and auth2 library
	gapi.load('client:auth2', initClient);
}

//authorize apps
function initClient() {
	gapi.client.init({
		clientId: CLIENT_ID,
		scope: SCOPES.join(' ')
	}).then(function () {

		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	});
}


//check the return authentication of the login is successful, we display the drive box and hide the login box.
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		gapi.client.load('drive', 'v2', updateEmail);
		$("#drive-box").show();
		$("#login-box").hide();
	} else {
		$("#login-box").show();
		$("#drive-box").hide();
	}
}

function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn().then(updateEmail);
}

function updateEmail() {
	var request = gapi.client.drive.about.get();
	request.execute(function (resp) {
		if (!resp.error) {
			document.getElementById("gmail").innerHTML = "Logged in as: " + resp.user.emailAddress;
		} else {
			showErrorMessage("Error: " + resp.error.message);
		}
	});
}

function handleSignoutClick(event) {
	if (confirm("Are you sure you want to logout?")) {
		gapi.auth2.getAuthInstance().signOut();
	}
}

/******************** END AUTHENTICATION ********************/


/******************** PAGE LOAD ********************/
function uploadPictures(folderID) {
	var links = document.querySelectorAll(".img_link");
	for (var i = 0; i < links.length; ++i) {
		var ImageURL = links[i].href;
		// Split the base64 string in data and contentType
		var block = ImageURL.split(";");
		// Get the content type of the image
		var contentType = block[0].split(":")[1]; // In this case "image/gif"
		// get the real base64 content of the file
		var realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
		var file = b64toBlob(realData, contentType);
		file.name = links[i].download;

		var metadata = {
			'title': file.name,
			'description': "bytutorial.com File Upload",
			'mimeType': file.type || 'application/octet-stream',
			"parents": [{
				"kind": "drive#file",
				"id": folderID
			}]
		};

		showProgressPercentage(0);

		try {
			var uploader = new MediaUploader({
				file: file,
				token: gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token,
				metadata: metadata,
				onError: function (response) {
					var errorResponse = JSON.parse(response);
					showErrorMessage("Error: " + errorResponse.error.message);
					$("#fUpload").val("");
					$("#upload-percentage").hide(1000);
					hideLoading();
				},
				onComplete: function (response) {
					hideStatus();
					$("#upload-percentage").hide(1000);
					var errorResponse = JSON.parse(response);
					if (errorResponse.message != null) {
						showErrorMessage("Error: " + errorResponse.error.message);
						$("#fUpload").val("");
						hideLoading();
					} else {
						hideStatus()
						hideLoading();
					}
				},
				onProgress: function (event) {
					showProgressPercentage(Math.round(((event.loaded / event.total) * 100), 0));
				},
				params: {
					convert: false,
					ocr: false
				}
			});
			uploader.upload();
		} catch (exc) {
			showErrorMessage("Error: " + exc);
			$("#fUpload").val("");
		}

	}
}


$("#gdrive-upload").click(function () {
	// $("#float-box").show();
	document.getElementById("float-box").classList.add("grid");
	$("#txtFolder").val("");
});

$("#root-folder").click(function () {
	if (IMAGE_COUNTER > 0) {
		showLoading();
		showStatus("Uploading Images To Drive...");
		uploadPictures("root");
	}
});

$("#insta-folder").click(function () {
	if (IMAGE_COUNTER > 0) {
		showLoading();
		var inputCheck = () => checkFolderExistence("InstaSquare");
		gapi.client.load('drive', 'v2', inputCheck);
	}
});

$("#custom-folder").click(function () {
	var input = document.querySelector("#txtFolder");
	input.disabled = false;
	input.classList.remove("disabled");
	input.focus();

	// Execute a function when the user releases a key on the keyboard
	input.addEventListener("keyup", function (event) {
		// Cancel the default action, if needed
		event.preventDefault();
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			if ($("#txtFolder").val() != "" && IMAGE_COUNTER > 0) {
				showLoading();
				var inputCheck = () => checkFolderExistence($("#txtFolder").val());
				gapi.client.load('drive', 'v2', inputCheck);
			} else {
				showErrorMessage("Type a folder name first!");
			}
		}
	});

});

function checkFolderExistence(folderName) {
	var request = gapi.client.drive.files.list({
		'maxResults': NO_OF_FILES,
		'q': "trashed=false and \"root\" in parents"
	});
	request.execute(function (resp) {
		if (!resp.error) {
			DRIVE_FILES = resp.items;
			var notFound = true;
			for (var i = 0; i < DRIVE_FILES.length; i++) {
				if (DRIVE_FILES[i].title === folderName) {
					// $("#float-box").hide();
					document.getElementById("float-box").classList.remove("grid");
					uploadPictures(DRIVE_FILES[i].id);
					notFound = false;
				}
			}
			if (notFound) makeFolder(folderName);

		} else {
			showErrorMessage("Error: " + resp.error.message);
		}
	});
}

function makeFolder(folderName) {
	console.log("makeFolder");
	document.getElementById("float-box").classList.remove("grid");
	// $("#float-box").hide();
	showLoading();
	showStatus("Creating folder in progress...");
	var access_token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
	var request = gapi.client.request({
		'path': '/drive/v2/files/',
		'method': 'POST',
		'headers': {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + access_token,
		},
		'body': {
			"title": folderName,
			"mimeType": "application/vnd.google-apps.folder",
			"parents": [{
				"kind": "drive#file",
				"id": "root"
			}]
		}
	});

	request.execute(function (resp) {
		if (!resp.error) {
			uploadPictures(resp.id);
		} else {
			hideStatus();
			hideLoading();
			showErrorMessage("Error: " + resp.error.message);
		}
	});
}

$(".btnClose, .imgClose").click(function () {
	document.getElementById("float-box").classList.remove("grid");
	// $("#float-box").hide();
});

/******************** END PAGE LOAD ********************/


/******************** NOTIFICATION ********************/
//show loading animation
function showLoading() {
	if ($("#drive-box-loading").length === 0) {
		$("#drive-box").prepend("<div id='drive-box-loading'></div>");
	}
	$("#drive-box-loading").html("<div id='loading-wrapper'><div id='loading'><img src='css/images/loading-bubble.gif'></div></div>");
}

//hide loading animation
function hideLoading() {
	$("#drive-box-loading").html("");
}


//show status message
function showStatus(text) {
	$("#status-message").show();
	$("#status-message").html(text);
}

//hide status message
function hideStatus() {
	$("#status-message").hide();
	$("#status-message").html("");
}

//show upload progress
function showProgressPercentage(percentageValue) {
	if ($("#upload-percentage").length == 0) {
		$("#drive-box").prepend("<div id='upload-percentage' class='flash'></div>");
	}
	if (!$("#upload-percentage").is(":visible")) {
		$("#upload-percentage").show(1000);
	}
	$("#upload-percentage").html(percentageValue.toString() + "%");
}

//show error message
function showErrorMessage(errorMessage) {
	$("#error-message").html(errorMessage);
	$("#error-message").show(100);
	setTimeout(function () {
		$("#error-message").hide(100);
	}, 3000);
}

/******************** END NOTIFICATION ********************/

/**
 * Helper for implementing retries with backoff. Initial retry
 * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
 *
 * @constructor
 */
var RetryHandler = function () {
	this.interval = 1000; // Start at one second
	this.maxInterval = 60 * 1000; // Don't wait longer than a minute 
};

/**
 * Invoke the function after waiting
 *
 * @param {function} fn Function to invoke
 */
RetryHandler.prototype.retry = function (fn) {
	setTimeout(fn, this.interval);
	this.interval = this.nextInterval_();
};

/**
 * Reset the counter (e.g. after successful request.)
 */
RetryHandler.prototype.reset = function () {
	this.interval = 1000;
};

/**
 * Calculate the next wait time.
 * @return {number} Next wait interval, in milliseconds
 *
 * @private
 */
RetryHandler.prototype.nextInterval_ = function () {
	var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
	return Math.min(interval, this.maxInterval);
};

/**
 * Get a random int in the range of min to max. Used to add jitter to wait times.
 *
 * @param {number} min Lower bounds
 * @param {number} max Upper bounds
 * @private
 */
RetryHandler.prototype.getRandomInt_ = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};


/**
 * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
 * files or in-memory constructs.
 *
 * @example
 * var content = new Blob(["Hello world"], {"type": "text/plain"});
 * var uploader = new MediaUploader({
 *   file: content,
 *   token: accessToken,
 *   onComplete: function(data) { ... }
 *   onError: function(data) { ... }
 * });
 * uploader.upload();
 *
 * @constructor
 * @param {object} options Hash of options
 * @param {string} options.token Access token
 * @param {blob} options.file Blob-like item to upload
 * @param {string} [options.fileId] ID of file if replacing
 * @param {object} [options.params] Additional query parameters
 * @param {string} [options.contentType] Content-type, if overriding the type of the blob.
 * @param {object} [options.metadata] File metadata
 * @param {function} [options.onComplete] Callback for when upload is complete
 * @param {function} [options.onProgress] Callback for status for the in-progress upload
 * @param {function} [options.onError] Callback if upload fails
 */
var MediaUploader = function (options) {
	var noop = function () {};
	this.file = options.file;
	this.contentType = options.contentType || this.file.type || 'application/octet-stream';
	this.metadata = options.metadata || {
		'title': this.file.name,
		'mimeType': this.contentType
	};
	this.token = options.token;
	this.onComplete = options.onComplete || noop;
	this.onProgress = options.onProgress || noop;
	this.onError = options.onError || noop;
	this.offset = options.offset || 0;
	this.chunkSize = options.chunkSize || 0;
	this.retryHandler = new RetryHandler();

	this.url = options.url;
	if (!this.url) {
		var params = options.params || {};
		params.uploadType = 'resumable';
		this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
	}
	this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

/**
 * Initiate the upload.
 */
MediaUploader.prototype.upload = function () {
	var self = this;
	var xhr = new XMLHttpRequest();

	xhr.open(this.httpMethod, this.url, true);
	xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

	xhr.onload = function (e) {
		if (e.target.status < 400) {
			var location = e.target.getResponseHeader('Location');
			this.url = location;
			this.sendFile_();
		} else {
			this.onUploadError_(e);
		}
	}.bind(this);
	xhr.onerror = this.onUploadError_.bind(this);
	xhr.send(JSON.stringify(this.metadata));
};

/**
 * Send the actual file content.
 *
 * @private
 */
MediaUploader.prototype.sendFile_ = function () {
	var content = this.file;
	var end = this.file.size;

	if (this.offset || this.chunkSize) {
		// Only bother to slice the file if we're either resuming or uploading in chunks
		if (this.chunkSize) {
			end = Math.min(this.offset + this.chunkSize, this.file.size);
		}
		content = content.slice(this.offset, end);
	}

	var xhr = new XMLHttpRequest();
	xhr.open('PUT', this.url, true);
	xhr.setRequestHeader('Content-Type', this.contentType);
	xhr.setRequestHeader('Content-Range', "bytes " + this.offset + "-" + (end - 1) + "/" + this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
	if (xhr.upload) {
		xhr.upload.addEventListener('progress', this.onProgress);
	}
	xhr.onload = this.onContentUploadSuccess_.bind(this);
	xhr.onerror = this.onContentUploadError_.bind(this);
	xhr.send(content);
};

/**
 * Query for the state of the file for resumption.
 *
 * @private
 */
MediaUploader.prototype.resume_ = function () {
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', this.url, true);
	xhr.setRequestHeader('Content-Range', "bytes */" + this.file.size);
	xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
	if (xhr.upload) {
		xhr.upload.addEventListener('progress', this.onProgress);
	}
	xhr.onload = this.onContentUploadSuccess_.bind(this);
	xhr.onerror = this.onContentUploadError_.bind(this);
	xhr.send();
};

/**
 * Extract the last saved range if available in the request.
 *
 * @param {XMLHttpRequest} xhr Request object
 */
MediaUploader.prototype.extractRange_ = function (xhr) {
	var range = xhr.getResponseHeader('Range');
	if (range) {
		this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
	}
};

/**
 * Handle successful responses for uploads. Depending on the context,
 * may continue with uploading the next chunk of the file or, if complete,
 * invokes the caller's callback.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadSuccess_ = function (e) {
	if (e.target.status == 200 || e.target.status == 201) {
		this.onComplete(e.target.response);
	} else if (e.target.status == 308) {
		this.extractRange_(e.target);
		this.retryHandler.reset();
		this.sendFile_();
	}
};

/**
 * Handles errors for uploads. Either retries or aborts depending
 * on the error.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onContentUploadError_ = function (e) {
	if (e.target.status && e.target.status < 500) {
		this.onError(e.target.response);
	} else {
		this.retryHandler.retry(this.resume_.bind(this));
	}
};

/**
 * Handles errors for the initial request.
 *
 * @private
 * @param {object} e XHR event
 */
MediaUploader.prototype.onUploadError_ = function (e) {
	this.onError(e.target.response); // TODO - Retries for initial upload
};

/**
 * Construct a query string from a hash/object
 *
 * @private
 * @param {object} [params] Key/value pairs for query string
 * @return {string} query string
 */
MediaUploader.prototype.buildQuery_ = function (params) {
	params = params || {};
	return Object.keys(params).map(function (key) {
		return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
	}).join('&');
};

/**
 * Build the drive upload URL
 *
 * @private
 * @param {string} [id] File ID if replacing
 * @param {object} [params] Query parameters
 * @return {string} URL
 */
MediaUploader.prototype.buildUrl_ = function (id, params, baseUrl) {
	var url = baseUrl || 'https://www.googleapis.com/upload/drive/v2/files/';
	if (id) {
		url += id;
	}
	var query = this.buildQuery_(params);
	if (query) {
		url += '?' + query;
	}
	return url;
};


/**
 * https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery
 * Convert a base64 string in a Blob according to the data and contentType.
 * 
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function b64toBlob(b64Data, contentType, sliceSize) {
	contentType = contentType || '';
	sliceSize = sliceSize || 512;

	var byteCharacters = atob(b64Data);
	var byteArrays = [];

	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);

		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
		}

		var byteArray = new Uint8Array(byteNumbers);

		byteArrays.push(byteArray);
	}

	var blob = new Blob(byteArrays, {
		type: contentType
	});
	return blob;
}