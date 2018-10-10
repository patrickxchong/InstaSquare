function downloadZip() {
  if (IMAGE_COUNTER > 0) {
    var zip = new JSZip()

    var links = document.querySelectorAll('.img_link')
    for (var i = 0; i < links.length; ++i) {
      // Add a file to the directory, in this case an image with data URI as contents
      zip.file(links[i].download, links[i].href.split('base64,')[1], {
        base64: true
      })
    }

    // Generate the zip file asynchronously
    zip
      .generateAsync({
        type: 'blob'
      })
      .then(function(content) {
        // Force down of the Zip file
        saveAs(content, 'images.zip')
      })
  }
}

function newFiles(element) {
  if (element.files.length > 20) {
    alert('Too many files uploaded! (Max 20)')
    return
  }

  document.querySelector('#img_placeholder').style.display = 'none'
  document.querySelector('#download-options').style.display = 'none'
  showLoading()
  showStatus('Uploading Images...')

  var app = document.getElementById('app')
  UPLOADED += element.files.length
  for (var i = 0; i < element.files.length; ++i) {
    setTimeout(readFileAndProcess.bind(null,element.files[i]), i*3000)
  }
}

function readFileAndProcess(file) {
  var formData = new FormData()
  var request = new XMLHttpRequest()
  formData.set('file', file)

  request.onreadystatechange = function() {
    //Call a function when the state changes.
    if (request.readyState == 4 && request.status == 200) {
      addImgToPage(request.responseText, 'ok')
    }
  }
  //Send the proper header information along with the request
  request.open('POST', '/', true)
  request.setRequestHeader('Cache-Control', 'no-cache')
  request.send(formData)
}

function addImgToPage(image, fileName) {
  var squared_file =
    fileName.split('.')[0] + '_squared.' + fileName.split('.')[1]

  var img_wrapper = document.createElement('div')
  img_wrapper.classList.add('img_wrapper')

  var img_data = document.createElement('img')
  img_data.classList.add('img_data')
  img_data.setAttribute('src', image)

  var img_link = document.createElement('a')
  img_link.classList.add('img_link')
  img_link.setAttribute('href', image)
  img_link.setAttribute('download', squared_file)

  var removeBtn = document.createElement('span')
  removeBtn.classList.add('remove')
  removeBtn.innerHTML = '&times;'
  removeBtn.addEventListener('click', function() {
    --IMAGE_COUNTER
    --UPLOADED
    this.parentNode.parentNode.parentNode.removeChild(
      this.parentNode.parentNode
    )
    if (document.querySelectorAll('.img_link').length == 0) {
      document.querySelector('#download-options').style.display = 'none'
      document.getElementById('img_placeholder').style.display = 'grid'
    }
  })

  img_link.appendChild(img_data)
  var div = document.createElement('div')
  div.appendChild(img_link)
  div.appendChild(removeBtn)
  img_wrapper.appendChild(div)
  app.appendChild(img_wrapper)

  ++IMAGE_COUNTER
  if (IMAGE_COUNTER === UPLOADED) {
    document.querySelector('#download-options').style.display = 'block'
    hideLoading()
    hideStatus()
  }
}
