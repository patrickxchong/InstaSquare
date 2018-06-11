function downloadZip() {
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

function showBtn() {
  document.querySelector("#download-wrapper").style.display = "inline";
}

function newFiles(element) {
  document.querySelector("#download-wrapper").style.display = "none";

  var app = document.getElementById("app");

  for (var i = 0; i < element.files.length; ++i) {
    readFileAndProcess(element.files[i], i, element.files.length);
  }

  function readFileAndProcess(readfile, counter, length) {
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      var worker = new Worker("js/worker.js");
      worker.onmessage = function (e) {
        var squared_file = readfile.name.split(".")[0] + "_squared." + readfile.name.split(".")[1];

        var img_wrapper = document.createElement("div");
        img_wrapper.classList.add("img_wrapper");

        var img_data = document.createElement("img");
        img_data.classList.add("img_data");
        img_data.setAttribute("src", e.data);

        var img_link = document.createElement("a");
        img_link.classList.add("img_link");
        img_link.setAttribute("href", e.data);
        img_link.setAttribute("download", squared_file)

        var removeBtn = document.createElement("span");
        removeBtn.classList.add("remove");
        removeBtn.innerHTML = "&times;";
        removeBtn.addEventListener("click", function () {
          this.parentNode.parentNode.removeChild(this.parentNode);
        });

        img_link.appendChild(img_data);
        var div = document.createElement("div");
        div.appendChild(img_link);
        div.appendChild(removeBtn);
        img_wrapper.appendChild(div);
        app.appendChild(img_wrapper);

        //best shot at delaying showing button so far
        if ((counter + 1) === length) {
          setTimeout(showBtn(), 3000);
        }

        // console.log(e.data);

      };
      worker.postMessage(this.result);
    });
    reader.readAsArrayBuffer(readfile);
  }


}