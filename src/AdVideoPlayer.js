
/**
 * The MediaPlayer is the interface for all media player.
 * We have two specific implementation of the MediaPlayer: VideoPlayer and ImagePlayer.
 */
var AdVideoPlayer =  function () {
    this.uri;
    this.video;

    this.isMediaSupported = function (mimeType) {
        if (!this.video) {
            throw "isMediaSupported(): element not created";
        }
        if (!(this.video instanceof HTMLMediaElement)) {
            throw "isMediaSupported(): element must be of type HTMLMediaElement";
        }

        var canPlay = this.video.canPlayType(mimeType);
        return (canPlay === "probably" || canPlay === "maybe");
    };
};


AdVideoPlayer.prototype = Object.create(AdMediaPlayer);

// AdMediaPlayer interface functions

AdVideoPlayer.prototype.load = function (baseUrl, mediaFiles) {

    // Create the video element
    this.video = document.createElement('video');
    this.video.autoplay = false;
    this.video.id = 'adsVideoPlayer';
    this.video.className = 'ads-video';
    //_adsContainer.appendChild(this.video);

    // Check if input format is supported
    if (!this.isMediaSupported(mediaFiles[0].type)) {
        return false;
    }

    // Sort the mediafiles in bitrate ascending order
    mediaFiles.sort(function(a, b) {
        if (a.bitrate && b.bitrate) {
            return a.bitrate - b.bitrate;
        }
        return -1;
    });

    // Play the media file with lowest bitrate
    this.uri = mediaFiles[0].uri;

    // Add base URL
    this.uri = (this.uri.indexOf('http://') === -1) ? (baseUrl + this.uri) : this.uri;
    this.video.src = this.uri;
    this.video.load();

    return true;
};

AdVideoPlayer.prototype.addEventListener = function (type, listener) {
    if (!this.video) {
        return;
    }
    this.video.addEventListener(type, listener);
};

AdVideoPlayer.prototype.removeEventListener = function (type, listener) {
    if (!this.video) {
        return;
    }
    this.video.removeEventListener(type, listener);
};

AdVideoPlayer.prototype.getDuration = function () {
    if (!this.video) {
        return;
    }
    return this.video.duration;
};

AdVideoPlayer.prototype.getCurrentTime = function () {
    if (!this.video) {
        return;
    }
    return this.video.currentTime;
};

AdVideoPlayer.prototype.play = function () {
    if (!this.video) {
        return;
    }
    this.video.play();
};

AdVideoPlayer.prototype.stop = function () {
    if (!this.video) {
        return;
    }
    this.video.pause();
};

AdVideoPlayer.prototype.reset = function () {
    if (!this.video) {
        return;
    }
    this.video.src = "";
    this.video = null;
};