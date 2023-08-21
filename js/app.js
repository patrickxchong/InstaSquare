function downloadZip() {
  if (IMAGE_COUNTER > 0) {
    let zip = new JSZip();

    let links = document.querySelectorAll(".img_link");
    for (let i = 0; i < links.length; ++i) {
      // Add a file to the directory, in this case an image with data URI as contents
      zip.file(links[i].download, links[i].href.split("base64,")[1], {
        base64: true,
      });
    }

    // Generate the zip file asynchronously
    zip
      .generateAsync({
        type: "blob",
      })
      .then(function(content) {
        // Force down of the Zip file
        saveAs(content, "images.zip");
      });
  }
}

function addImgToPage(image, fileName) {
  let squared_file =
    fileName.split(".").slice(0, -1).join(".") + "_squared." + fileName.split(".").at(-1);

  let img_wrapper = document.createElement("div");
  img_wrapper.classList.add("img_wrapper");

  let img_data = document.createElement("img");
  img_data.classList.add("img_data");
  img_data.setAttribute("src", image);

  let img_link = document.createElement("a");
  img_link.classList.add("img_link");
  img_link.setAttribute("href", image);
  img_link.setAttribute("download", squared_file);

  let removeBtn = document.createElement("span");
  removeBtn.classList.add("remove");
  removeBtn.innerHTML = "&times;";
  removeBtn.addEventListener("click", function() {
    --IMAGE_COUNTER;
    this.parentNode.parentNode.parentNode.removeChild(
      this.parentNode.parentNode,
    );
    if (document.getElementsByClassName("img_link").length == 0) {
      document.getElementById("download-options").style.display = "none";
      document.getElementById("img_placeholder").style.display = "grid";
    }
  });

  img_link.appendChild(img_data);
  let div = document.createElement("div");
  div.appendChild(img_link);
  div.appendChild(removeBtn);
  img_wrapper.appendChild(div);
  document.getElementById("app").appendChild(img_wrapper);
}

function newFiles(element) {
  if (element.files.length > 50) {
    alert("Too many files uploaded! (Max 50)");
    return;
  }

  document.getElementById("img_placeholder").style.display = "none";
  document.getElementById("download-options").style.display = "none";
  showLoading();
  showStatus("Uploading Images...");

  // recursive implementation of image processing
  readFileAndProcess(element, 0, element.files.length);

  function readFileAndProcess(element, counter, length) {
    ++IMAGE_COUNTER;
    let reader = new FileReader();
    reader.file = element.files[counter];

    reader.onloadstart = function(progressEvent) {
      // console.log("readStart", progressEvent);
    };

    reader.onloadend = function(progressEvent) {
      // console.log("readEnd", progressEvent, this);
    };

    reader.onprogress = function(progressEvent) {
      // console.log("readProgress", progressEvent);
      if (progressEvent.lengthComputable) {
        let percentage = Math.round((event.loaded * 100) / event.total);
        // console.log("readProgress: Loaded : " + percentage + "%");
      }
    };

    reader.onerror = function(progressEvent) {
      console.log("readError", progressEvent);
      switch (progressEvent.target.error.code) {
        case progressEvent.target.error.NOT_FOUND_ERR:
          alert("File not found!");
          break;
        case progressEvent.target.error.NOT_READABLE_ERR:
          alert("File not readable!");
          break;
        case progressEvent.target.error.ABORT_ERR:
          break;
        default:
          alert("Unknow Read error.");
      }
    };

    // Set the image once loaded into file reader
    reader.onload = function(e) {
      // Create an image
      let img = new Image();
      img.src = e.target.result;

      img.onload = function() {
        let dataurl = imageToDataUri(img);
        setTimeout(() => {
          addImgToPage(dataurl, element.files[counter].name);
          // Stop condition for recursion
          if (counter + 1 === length) {
            document.getElementById("download-options").style.display = "block";
            hideLoading();
            hideStatus();
          }
          // load in next picture
          else if (counter + 1 < length) {
            setTimeout(() => {
              readFileAndProcess(element, counter + 1, length);
            }, 1000);
          }
        }, 1000);
      };
    };

    reader.readAsDataURL(element.files[counter]);
  }
}

function imageToDataUri(img) {
  // create an off-screen canvas
  let canvas = document.createElement("canvas"),
    ctx = canvas.getContext("2d");

  // set its dimension to target size
  if (img.height > img.width) {
    canvas.width = img.height;
    canvas.height = img.height;
  } else {
    canvas.width = img.width;
    canvas.height = img.width;
  }

  // get offsets to position image into center of canvas element
  let xOffset = img.width < canvas.width ? (canvas.width - img.width) / 2 : 0;
  let yOffset =
    img.height < canvas.height ? (canvas.height - img.height) / 2 : 0;

  // set its dimension to target size
  if (img.height > img.width) {
    // fill entire canvas with white first
    ctx.beginPath();
    ctx.rect(0, 0, xOffset + 10, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.rect(xOffset + img.width - 10, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
  } else {
    // fill entire canvas with white first
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, yOffset + 10);
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0, yOffset + img.height - 10, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();
  }
  // draw source image into the off-screen canvas:
  ctx.drawImage(img, xOffset, yOffset, img.width, img.height);

  // encode image to data-uri with base64 version of compressed image
  return canvas.toDataURL();
}
