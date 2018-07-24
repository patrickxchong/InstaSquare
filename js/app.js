function downloadZip() {
  if (IMAGE_COUNTER > 0) {
    var zip = new JSZip();

    var links = document.querySelectorAll(".img_link");
    for (var i = 0; i < links.length; ++i) {
      // Add a file to the directory, in this case an image with data URI as contents
      zip.file(links[i].download, links[i].href.split('base64,')[1], {
        base64: true
      });
    }

    // Generate the zip file asynchronously
    zip.generateAsync({
        type: "blob"
      })
      .then(function (content) {
        // Force down of the Zip file
        saveAs(content, "images.zip");
      });
  }
}

function newFiles(element) {
  document.querySelector("#img_placeholder").style.display = "none";
  document.querySelector("#download-options").style.display = "none";
  showLoading();
  showStatus("Uploading Images...");

  var app = document.getElementById("app");

  for (var i = 0; i < element.files.length; ++i) {
    ++IMAGE_COUNTER;
    readFileAndProcess(element.files[i], i, element.files.length);
  }

  function readFileAndProcess(readfile, counter, length) {
    var reader = new FileReader();
    reader.file = readfile;

    reader.onloadstart = function (progressEvent) {
      // var arrayBuffer = reader.result;
      console.log('readStart', progressEvent);
    }

    reader.onloadend = function (progressEvent) {
      console.log('readEnd', progressEvent, this);
      var fileReader = this;
      var fileContent = fileReader.result;
      var fileName = fileReader.file.name;
      console.log('readEnd:', fileName, fileContent);

      function addImgToPage(image, fileName) {
        var squared_file = fileName.split(".")[0] + "_squared." + fileName.split(".")[1];

        var img_wrapper = document.createElement("div");
        img_wrapper.classList.add("img_wrapper");

        var img_data = document.createElement("img");
        img_data.classList.add("img_data");
        img_data.setAttribute("src", image);

        var img_link = document.createElement("a");
        img_link.classList.add("img_link");
        img_link.setAttribute("href", image);
        img_link.setAttribute("download", squared_file)

        var removeBtn = document.createElement("span");
        removeBtn.classList.add("remove");
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", function () {
          --IMAGE_COUNTER;
          this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
          if (document.querySelectorAll(".img_link").length == 0) {
            document.querySelector("#download-options").style.display = "none";
            document.getElementById("img_placeholder").style.display = "grid";
          }
        });

        img_link.appendChild(img_data);
        var div = document.createElement("div");
        div.appendChild(img_link);
        div.appendChild(removeBtn);
        img_wrapper.appendChild(div);
        app.appendChild(img_wrapper);
      }

      Jimp.read(fileContent).then(function (image) {
        if (image.bitmap.width > image.bitmap.height) {
          image.contain(image.bitmap.width, image.bitmap.width).quality(100)
            .background(0xFFFFFFFF)
            .getBase64(Jimp.AUTO, function (err, src) {
              if (err) throw err;
              addImgToPage(src, fileName);
              if ((counter + 1) === length) {
                document.querySelector("#download-options").style.display = "block";
                hideLoading();
                hideStatus();
              }
            })

        } else {
          image.contain(image.bitmap.height, image.bitmap.height).quality(100)
            .background(0xFFFFFFFF)
            .getBase64(Jimp.AUTO, function (err, src) {
              if (err) throw err;
              addImgToPage(src, fileName);
              if ((counter + 1) === length) {
                document.querySelector("#download-options").style.display = "block";
                hideLoading();
                hideStatus();
              }
            })
        }
      })
    }

    reader.onprogress = function (progressEvent) {
      console.log('readProgress', progressEvent);
      if (progressEvent.lengthComputable) {
        var percentage = Math.round((event.loaded * 100) / event.total);
        console.log('readProgress: Loaded : ' + percentage + '%');
      }
    }

    reader.onerror = function (progressEvent) {
      console.log('readError', progressEvent);
      switch (progressEvent.target.error.code) {
        case progressEvent.target.error.NOT_FOUND_ERR:
          alert('File not found!');
          break;
        case progressEvent.target.error.NOT_READABLE_ERR:
          alert('File not readable!');
          break;
        case progressEvent.target.error.ABORT_ERR:
          break;
        default:
          alert('Unknow Read error.');
      }
    }

    reader.readAsArrayBuffer(readfile);

  }





}