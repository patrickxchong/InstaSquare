const express = require('express')
// const bodyParser = require('body-parser');
const app = express()
const jimp = require('jimp')
// const { parse } = require('querystring');
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
var fs = require('fs')
var path = require('path')

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index')
})

app.post('/', upload.single('file'), function(req, res) {
  jimp.read(req.file.path).then(function(image) {
    if (image.bitmap.width > image.bitmap.height) {
      image
        .contain(image.bitmap.width, image.bitmap.width)
        .quality(100)
        .background(0xffffffff)
        .getBase64(jimp.AUTO, function(err, src) {
          if (err) throw err
          fs.unlink(req.file.path, function(err) {
            if (err) return console.log(err)
            console.log('file deleted successfully')
          })
          res.send(src)
        })
    } else {
      image
        .contain(image.bitmap.height, image.bitmap.height)
        .quality(100)
        .background(0xffffffff)
        .getBase64(jimp.AUTO, function(err, src) {
          if (err) throw err
          fs.unlink(req.file.path, function(err) {
            if (err) return console.log(err)
            console.log('file deleted successfully')
          })
          res.send(src)
        })
    }
  })
})
app.listen(process.env.PORT || 8000, function() {
  console.log('InstaSquare!')
})
