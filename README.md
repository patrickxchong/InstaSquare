# InstaSquare

A web app to square photos in bulk to upload into Instagram albums. The app is a basic HTML, CSS and JavaScript web app built without any frameworks.

This web app was created because my friend Claire told me about their difficulties with bulk uploading photos into Instagram. Instagram would allow users to upload in bulk either ONLY portrait pictures, ONLY landscape pictures or ONLY square pictures (in this case, the portait/landscape photos will be cropped). 

However, Claire wanted to upload a mix of both portait + landscape pictures and didn't want the pictures to be cropped, they wanted white borders to be added to the shorter side of the picture to square it. Other image squaring products exist in the market but they only do photos individually, causing additional work per photo. When I heard about the problem from Claire, I set out to build the bulk image squarer prototype as a web app to make it easier for them to access and use it.

## Installation and Usage

This project would not have been possible without the help of the following Javascript libraries:
* [Jimp](https://github.com/oliver-moran/jimp) - To square the images
* [JSZip](https://stuk.github.io/jszip/) - To store squared images for download
* [Filesaver](https://github.com/eligrey/FileSaver.js/) - To download the zip file created by JSZip

## Installation and Usage

To run the web app locally
* Install the following dependencies
    * Python 3.5/3.6
* Fork a copy of this git repo
* Run `python -m http.server 8000` in the folder containing `index.html`
* Go to `http://localhost:8000/index.html` on any modern web browser

Alternatively, navigate to https://instant-square.firebaseapp.com for an hosted version of the app.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## History
* 0.2.2
    * Cleaned up codebase
* 0.2.1
    * Additional feature #4: Display whether the user has connected their Google Drive account. If they have, display the GDrive account that is connected
* 0.2.0
    * Created new user interface by modifying the [Prologue theme from HTML5Up](https://html5up.net/prologue)
* 0.1.3
    * Additional feature #3: Create a custom Google Drive folder to upload squared pictures 
* 0.1.2
    * Additional feature #2: Upload squared pictures to Google Drive root folder
* 0.1.1
    * Additional feature #1: X button to remove unwanted images
* 0.1.0
    * Succesfully built a simple prototype that takes in user uploaded files and adds borders to the pictures to square them


## Credits

* My friend Claire who came to me to ask about a solution to her photography problems.
* Ideas for additional features and overall design credit goes to the same friend Claire who has shown me tremendous support
* A BIG THANK YOU goes to Andy Suwandy who wrote [this tutorial](http://bytutorial.com/tutorials/google-api/introduction-to-google-drive-api-using-javascript) on how to connect to the Google Drive API via in browser Javascript. It took me the longest time to find a method that works.
* HTML5Up for the Prologue Theme which I adapted for the user interface.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE.md](LICENSE.md) file for details