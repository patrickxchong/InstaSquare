/*****
http://bytutorial.com/tutorials/google-api/introduction-to-google-drive-api-using-javascript
Bytutorial.com - online community to share articles for web and mobile programming and designers.
Author: Andy Suwandy

NOTE: Please change the CLIENT ID by creating your own app in google.
In order to work in your local computer, please change the client ID in the code and set the url of where the google drive app will be loaded.
otherwise you should get an error message saying the url you try to load does not match.
****/

/******************** GLOBAL VARIABLES ********************/
var SCOPES = ['https://www.googleapis.com/auth/drive', 'profile'];
var CLIENT_ID = '440020782887-1rsqas8u0rkldf67hluinf08rg2m3f3a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDGuCafsO0QzpYuSJzsm-tly1Lsc2WxGKQ';
var FOLDER_NAME = "";
var FOLDER_ID = "root";
var FOLDER_PERMISSION = true;
var FOLDER_LEVEL = 0;
var NO_OF_FILES = 1000;
var DRIVE_FILES = [];
var FILE_COUNTER = 0;
var FOLDER_ARRAY = [];

/******************** AUTHENTICATION ********************/

function handleClientLoad() {
	// Load the API client and auth2 library
	gapi.load('client:auth2', initClient);
}

//authorize apps
function initClient() {
	gapi.client.init({
		//apiKey: API_KEY, //THIS IS OPTIONAL AND WE DONT ACTUALLY NEED THIS, BUT I INCLUDE THIS AS EXAMPLE
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
		$("#drive-box").show();
		$("#drive-box").css("display", "inline-block");
		$("#login-box").hide();
	} else {
		$("#login-box").show();
		$("#drive-box").hide();
	}
}

function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
	if (confirm("Are you sure you want to logout?")) {
		gapi.auth2.getAuthInstance().signOut();
	}
}

/******************** END AUTHENTICATION ********************/


/******************** PAGE LOAD ********************/


$("#button-upload").click(function () {
	showLoading();
	showStatus("Uploading file(s) in progress...");

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
				"id": FOLDER_ID
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
						// //getDriveFiles();
						hideLoading();
					} else {
						showStatus("Loading Google Drive files...");
						//getDriveFiles();
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
			// console.log(uploader);
		} catch (exc) {
			showErrorMessage("Error: " + exc);
			$("#fUpload").val("");
			//getDriveFiles();
		}



	}



});

$("#button-addfolder").click(function () {
	$("#transparent-wrapper").show();
	$("#float-box").show();
	$("#txtFolder").val("");
});

$("#btnAddFolder").click(function () {
	if ($("#txtFolder").val() == "") {
		alert("Please enter the folder name");
	} else {
		$("#transparent-wrapper").hide();
		$("#float-box").hide();
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
				"title": $("#txtFolder").val(),
				"mimeType": "application/vnd.google-apps.folder",
				"parents": [{
					"kind": "drive#file",
					"id": FOLDER_ID
				}]
			}
		});

		request.execute(function (resp) {
			if (!resp.error) {
				showStatus("Loading Google Drive files...");
				//getDriveFiles();
				hideLoading();
			} else {
				hideStatus();
				hideLoading();
				showErrorMessage("Error: " + resp.error.message);
			}
		});
	}
});

$(".btnClose, .imgClose").click(function () {
	$("#transparent-wrapper").hide();
	$(".float-box").hide();
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