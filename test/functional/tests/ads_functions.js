
define(function () {

    return {

        play: function () {
            document.querySelector("#adsplayer-video").play();
        },

        pause: function () {
            document.querySelector("#adsplayer-video").pause();
        },

        stop: function () {
            document.querySelector("#adsplayer-video").stop();
        },

        seek: function (time) {
            var video = document.querySelector("#adsplayer-video");
            video.currentTime = time;
        },

        getCurrentTime: function() {
            return document.querySelector("#adsplayer-video").currentTime;
        },

        getDuration: function() {
            return document.querySelector("#adsplayer-video").duration;
        },

        isPaused: function () {
            return document.querySelector("#adsplayer-video").paused;
        },

        waitForEvent: function (event, done) {
            var video = document.querySelector("#adsplayer-video"),
                onEventHandler = function() {
                    video.removeEventListener(event, onEventHandler);
                    done(true);
                };

            video.addEventListener(event, onEventHandler);
        },

        isPlaying: function (delay, done) {
            var video = document.querySelector("#adsplayer-video"),
                startTime = -1,
                onPlaying = function() {
                    video.removeEventListener('playing', onPlaying);
                    isProgressing(delay, done);
                },
                onTimeUpdate = function() {
                    if (startTime < 0) {
                        startTime = video.currentTime;
                    } else {
                        if (video.currentTime >= startTime + delay) {
                            video.removeEventListener('timeupdate', onTimeUpdate);
                            done(true);
                        }
                    }
                },
                isProgressing = function(delay, done) {
                    if (delay <= 0) {
                        done(true);
                    } else {
                        video.addEventListener('timeupdate', onTimeUpdate);
                    }
                };

            if (!video.paused) {
                isProgressing(delay, done);
            }else{
                video.addEventListener('playing', onPlaying);
            }
        }
    };
});

