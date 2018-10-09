const functions = require('firebase-functions')

const express = require('express')
// const bodyParser = require('body-parser');
const app = express()
const Jimp = require('jimp')
// const { parse } = require('querystring');
// var multer = require('multer')
// var upload = multer({ dest: 'uploads/' })
var fs = require('fs')
var os = require('os')
var path = require('path')
const Busboy = require('busboy')

app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', function(req, res) {
  res.render('index')
})

app.post('/upload', function(req, res) {
  // console.log(req.rawBody)
  const busboy = new Busboy({ headers: req.headers })
  const tmpdir = os.tmpdir()
  // This object will accumulate all the fields, keyed by their name
  const fields = {}

  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads = {}

  // This code will process each non-file field in the form.
  busboy.on('field', (fieldname, val) => {
    // TODO(developer): Process submitted field values here
    console.log(`Processed field ${fieldname}: ${val}.`)
    fields[fieldname] = val
  })

  let fileWrites = []

  // This code will process each file uploaded.
  busboy.on('file', (fieldname, file, filename) => {
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    console.log(`Processed file ${filename}`)
    const filepath = path.join(tmpdir, filename)
    uploads[fieldname] = filepath

    const writeStream = fs.createWriteStream(filepath)
    file.pipe(writeStream)

    // File was processed by Busboy; wait for it to be written to disk.
    const promise = new Promise((resolve, reject) => {
      file.on('end', () => {
        writeStream.end()
      })
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
    fileWrites.push(promise)
  })

  // Triggered once all uploaded files are processed by Busboy.
  // We still need to wait for the disk writes (saves) to complete.
  busboy.on('finish', () => {
    Promise.all(fileWrites).then(() => {
      // TODO(developer): Process saved files here
      for (const name in uploads) {
        const file = uploads[name]
        Jimp.read(file).then(function(image) {
          if (image.bitmap.width > image.bitmap.height) {
            image
              .contain(image.bitmap.width, image.bitmap.width)
              .quality(100)
              .background(0xffffffff)
              .getBase64(Jimp.AUTO, function(err, src) {
                if (err) throw err
                res.send(src)
              })
          } else {
            image
              .contain(image.bitmap.height, image.bitmap.height)
              .quality(100)
              .background(0xffffffff)
              .getBase64(Jimp.AUTO, function(err, src) {
                if (err) throw err
                res.send(src)
              })
          }
        })
      }

      for (const name in uploads) {
        const file = uploads[name]
        fs.unlinkSync(file)
      }
    })
  })

  busboy.end(req.rawBody)
})

// app.listen(8000, function() {
//   console.log('Example app listening on port 3000!')
// })

exports.app = functions.https.onRequest(app)
