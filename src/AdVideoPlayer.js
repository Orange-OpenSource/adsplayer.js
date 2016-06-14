
/**
 * The MediaPlayer is the interface for all media player.
 * We have two specific implementation of the MediaPlayer: VideoPlayer and ImagePlayer.
 */
var AdVideoPlayer =  function () {
	this.video;

	this.isMediaSupported = function (mimeType) {
		;
	}
};


AdVideoPlayer.prototype = Object.create(AdMediaPlayer);

// Private functions
AdVideoPlayer.prototype.supportMedia = function (mimeType) {

};

// AdMediaPlayer interface functions

AdVideoPlayer.prototype.play = function (mediaFiles) {

};

AdVideoPlayer.prototype.addEventListener = function (type, listener) {

};

AdVideoPlayer.prototype.removeEventListener = function (type, listener) {

};

AdVideoPlayer.prototype.stop = function () {

};

AdVideoPlayer.prototype.reset = function () {

};