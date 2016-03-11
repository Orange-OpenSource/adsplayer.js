//COPYRIGHT/* Last build : @@TIMESTAMP / git revision : @@REVISION */
/* jshint ignore:start */
var orangeHasPlayer = null, config = null, video = null, currentStreamInfos = null, configMetrics = {
    name: "Prisme (local)",
    activationUrl: "",
    serverUrl: "http://localhost:8080/metrics",
    enable: true,
    eventsObjectFilter: "session;realtime",
    eventTypeSessionFilter: "error;profil,10,10;usage",
    eventTypeRealTimeFilter: "error,10,40,99;profil",
    dbServerUrl: "http://localhost:8080/metricsDB",
    collector: "HasPlayerCollector",
    formatter: "Prisme",
    sendingTime: 1e4
};

function createHasPlayer(isSubtitleExternDisplay) {
    orangeHasPlayer = new OrangeHasPlayer();
    video = document.getElementById("player");
    orangeHasPlayer.init(video);
    orangeHasPlayer.enableSubtitleExternDisplay(isSubtitleExternDisplay);
    orangeHasPlayer.setInitialQualityFor("video", 0);
    orangeHasPlayer.setInitialQualityFor("audio", 0);
    loadHasPlayerConfig("json/hasplayer_config.json");
    orangeHasPlayer.setDebug(true);
    orangeHasPlayer.setDefaultAudioLang("fra");
    orangeHasPlayer.setDefaultSubtitleLang("fre");
    orangeHasPlayer.setSubtitleVisibility(false);
    registerHasPlayerEvents();
}

function registerHasPlayerEvents() {
    orangeHasPlayer.addEventListener("warning", onWarning);
    orangeHasPlayer.addEventListener("error", onError);
    orangeHasPlayer.addEventListener("cueEnter", onSubtitleEnter);
    orangeHasPlayer.addEventListener("cueExit", onSubtitleExit);
    orangeHasPlayer.addEventListener("loadeddata", onload);
    orangeHasPlayer.addEventListener("play_bitrate", onPlayBitrateChanged);
    orangeHasPlayer.addEventListener("download_bitrate", onDownloadBitrateChanged);
    orangeHasPlayer.addEventListener("bufferLevel_updated", onBufferLevelUpdated);
    orangeHasPlayer.addEventListener("volumechange", onVolumeChange);
    orangeHasPlayer.addEventListener("play", onPlay);
    orangeHasPlayer.addEventListener("pause", onPause);
    orangeHasPlayer.addEventListener("ended", onEnd);
    orangeHasPlayer.addEventListener("state_changed", onStateChanged);
    orangeHasPlayer.addEventListener("timeupdate", onTimeUpdate);
    orangeHasPlayer.addEventListener("manifestUrlUpdate", onManifestUrlUpdate);
}

function loadHasPlayerConfig(fileUrl) {
    var reqConfig = new XMLHttpRequest();
    reqConfig.onload = function() {
        if (reqConfig.status === 200) {
            config = JSON.parse(reqConfig.responseText);
            if (orangeHasPlayer && config) {
                orangeHasPlayer.setParams(config);
            }
        }
    };
    reqConfig.open("GET", fileUrl, true);
    reqConfig.setRequestHeader("Content-type", "application/json");
    reqConfig.send();
}

function onload() {
    handleAudioData(orangeHasPlayer.getAudioTracks(), orangeHasPlayer.getSelectedAudioTrack());
    handleSubtitleData(orangeHasPlayer.getSubtitleTracks(), orangeHasPlayer.getSelectedSubtitleTrack());
    handleDuration(orangeHasPlayer.getDuration());
    handleBitrates(orangeHasPlayer.getVideoBitrates());
}

function onSubtitleEnter(e) {
    handleSubtitleEnter(e.data);
}

function onSubtitleExit(e) {
    handleSubtitleExit(e.data);
}

function onWarning(e) {
    handleWarning(e.data);
}

function onError(e) {
    orangeHasPlayer.reset(2);
    handleError(e.data);
}

function onPlayBitrateChanged(e) {
    if (e.detail.type === "video") {
        handlePlayBitrate(e.detail.bitrate, e.detail.time);
    }
}

function onDownloadBitrateChanged(e) {
    if (e.detail.type === "video") {
        handleDownloadedBitrate(e.detail.bitrate, e.detail.time);
    }
}

function onBufferLevelUpdated(e) {
    handleBufferLevelUpdated(e.detail.type, e.detail.level.toFixed(3));
}

function onVolumeChange() {
    handleVolumeChange(orangeHasPlayer.getVolume());
}

function onPlay() {
    handlePlayState(true);
}

function onPause() {
    handlePlayState(false);
}

function onEnd() {
    handleVideoEnd();
}

function onStateChanged(e) {
    if (e.detail.type === "video") {
        if (e.detail.state === "buffering") {
            handleBuffering(true);
        } else if (e.detail.state === "playing") {
            handleBuffering(false);
        }
    }
}

function onTimeUpdate() {
    handleTimeUpdate(video.currentTime);
}

function onManifestUrlUpdate() {
    if (currentStreamInfos) {
        orangeHasPlayer.refreshManifest(currentStreamInfos.url);
    }
}

function loadStream(streamInfos, optimizedZappingEnabled) {
    handleBuffering(true);
    if (!optimizedZappingEnabled) {
        orangeHasPlayer.setInitialQualityFor("video", 0);
        orangeHasPlayer.setInitialQualityFor("audio", 0);
    }
    currentStreamInfos = streamInfos;
    orangeHasPlayer.load(streamInfos.url, streamInfos.protData);
}

function changeAudio(track) {
    orangeHasPlayer.setAudioTrack(track);
    orangeHasPlayer.setDefaultAudioLang(track.lang);
}

function enableSubtitles(enable) {
    orangeHasPlayer.setSubtitleVisibility(enable);
}

function changeSubtitle(track) {
    orangeHasPlayer.setSubtitleTrack(track);
    orangeHasPlayer.setDefaultSubtitleLang(track.lang);
}

function setPlayerMute() {
    orangeHasPlayer.setMute(!orangeHasPlayer.getMute());
}

function setPlayerVolume(value) {
    orangeHasPlayer.setVolume(value);
}

function changePlayerState() {
    if (video.paused) {
        orangeHasPlayer.play();
    } else {
        if (orangeHasPlayer.isLive()) {
            orangeHasPlayer.stop();
        } else {
            orangeHasPlayer.pause();
        }
    }
}

function setSeekValue(seekTime) {
    orangeHasPlayer.seek(seekTime);
}
/* jshint ignore:end */
