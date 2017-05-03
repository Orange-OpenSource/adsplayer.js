# adsplayer.js [![Build Status](https://travis-ci.org/Orange-OpenSource/adsplayer.js.svg?branch=development&style=flat-square)](https://travis-ci.org/Orange-OpenSource/adsplayer.js)

adsplayer.js is a plugin/module for hasplayer.js [https://github.com/Orange-OpenSource/hasplayer.js] that handles ad-insertion when playing streams with hasplayer.js player.
adsplayer.js v1.0.0 is compatible with MAST file format for describing the list of ad-insertion triggers, and with VAST format for ads playing description.
When opening a new stream with hasplayer.js, the adsplayer.js plugin handles ad-insertion in the cast a MAST description is provided.

The adsplayer.js plugin takes charge of:
* MAST and VAST files downloading
* detecting ad-insertion triggers
* pausing and then resuming the MediaPlayer video when playing ad(s)
* opening and playing ad media files, by the help of &lt;video&gt; and &lt;img&gt; HTML components, created by the plugin and appended in the DOM container provided to the plugin

The application that uses hasplayer.js in conjunction with adsplayer.js has to take charge of:
* hiding/showing adsplayer.js components according to the events raised by the plugin
* opening the web page when a click on the playing ad has been detected by the plugin
* pausing/resuming the plugin (for example when application visibility changes)

## Build / Run

``` bash
# npm run build
```

The resulting built file adsplayer(.min).js has to be included along with hasplayer.js.

## Getting Started

When creating the hasplayer.js's MediaPlayer instance, create an AdsPlayer instance and add it to the MediaPlayer.
The DOM element in which &lt;video&gt; and &lt;img&gt; HTML components for playing ad(s) will be appended has to be provided in the constuctor.

``` js
var mediaPlayer = new MediaPlayer();
var adsPlayer = new adsplayer.AdsPlayer(document.getElementById('adsplayer-container'));
mediaPlayer.addPlugin(adsPlayer);
```

When opening a stream with the MediaPlayer, the URL for MAST file has to be provided in the 'adsUrl' stream parameter.

``` js
var stream = {
    url: "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",
    adsUrl: "<mast-file-url>"
};
mediaPlayer.load(stream);
```

In order to interact with AdsPlayer, the application has to register to some events raised by the AdsPlayer:

``` js
adsPlayer.addEventListener("start", function (e) {
    // Ad(s) playback is starting => show ad(s) player container and hide main video
});
adsPlayer.addEventListener("end", function (e) {
    // Ad(s) playback has ended => hide ad(s) player container and show main video
});
adsPlayer.addEventListener("addElement", function (e) {
    // a DOM element for playing an ad has been created and will be appended in the ads player container. The element can be either a &lt;video&gt; or an &lt;img&gt; element
});
adsPlayer.addEventListener("removeElement", function (e) {
    // the DOM element for playing an ad is being removed from the ads player container and deleted
});
adsPlayer.addEventListener("play", function (e) {
    // An ad's media playback is starting => update play/pause button
});
adsPlayer.addEventListener("pause", function (e) {
    // An ad's media playback is paused => update play/pause button
});
adsPlayer.addEventListener("click", function (e) {
    // A click has beed detected on the media component
    // e.data.uri contains the URI of the webpage to open
});
```

AdsPlayer propose some more specific API methods in order to interact with the ad(s) playing:

``` js
adsPlayer.pause(); // Pause the playback of the current ad media
adsPlayer.play();  // Play/resume the playback of the current ad media
```

## License

All code in this repository is covered by the [BSD-3 license](http://opensource.org/licenses/BSD-3-Clause).
See LICENSE file for copyright details.


## Documentation

This API documentation describing AdsPlayer public methods and events can be generated using following gulp command:

``` bash
# npm run doc
```
