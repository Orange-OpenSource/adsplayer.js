
/**
 * The MediaPlayer is the interface for all media player.
 * We have two specific implementation of the MediaPlayer: VideoPlayer and ImagePlayer.
 */

var MediaPlayer =  {

    load: function (baseUrl, mediaFiles) {
        console.log("load() method is not defined");
    },

    getElement: function () {
        return null;
    },

    addEventListener: function (type, listener) {},

    removeEventListener: function (type, listener) {},

    getDuration: function () {},

    getCurrentTime: function () {},

    play: function () {},

    stop: function () {},

    reset: function () {}
};