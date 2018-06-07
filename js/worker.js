/* eslint-env worker*/
/* global Jimp */

importScripts("jimp.min.js");

self.addEventListener("message", function (e) {
  Jimp.read(e.data).then(function (image) {
    console.log(e);
    if (image.bitmap.width > image.bitmap.height) {
      image.contain(image.bitmap.width, image.bitmap.width)
        
    } else {
      image.contain(image.bitmap.height, image.bitmap.height)
    }
    image.quality(100)
    .background(0xFFFFFFFF)
    .getBase64(Jimp.AUTO, function (err, src) {
      if (err) throw err;
      self.postMessage(src);
      self.close();
    })
  })
})