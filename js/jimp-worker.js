/* eslint-env worker */
/* global Jimp */

importScripts('jimp.min.js')

self.addEventListener('message', e => {
  Jimp.read(e.data).then(image => {
    if (image.bitmap.width > image.bitmap.height) {
      image
        .contain(image.bitmap.width, image.bitmap.width)
        .quality(100)
        .background(0xffffffff)
        .getBase64(Jimp.AUTO, function(err, src) {
          if (err) throw err
          self.postMessage(src)
          self.close()
        })
    } else {
      image
        .contain(image.bitmap.height, image.bitmap.height)
        .quality(100)
        .background(0xffffffff)
        .getBase64(Jimp.AUTO, function(err, src) {
          if (err) throw err
          self.postMessage(src)
          self.close()
        })
    }
  })
})
