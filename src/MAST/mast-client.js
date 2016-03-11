AdsPlayer.dependencies.MastClient = function() {
    'use strict';
    this.mastLoader = new AdsPlayer.dependencies.MastLoader();
    this.mastParser = new AdsPlayer.dependencies.MastParser();
    this.video = null;
};

AdsPlayer.dependencies.MastClient.prototype = {
    constructor: AdsPlayer.dependencies.MastClient
};

AdsPlayer.dependencies.MastClient.prototype.start = function(url, video, listener, ads) {
    var self = this;
    var Cue = window.VTTCue || window.TextTrackCue;

    self.video = video;
	var theAds=ads;
    this.mastLoader.Load(url, function(result) {
            var resu = self.mastParser.parse(result),
                triggers = null,
                startConditions,
                endConditions,
                sources,
                i = 0,
                j = 0,
                positionStart = 0,
                positionEnd = 0;

                if (resu) {
                    triggers = self.mastParser.getTriggersList();
                    var track = video.addTextTrack("chapters", "orange", "test");
                    track.mode = "hidden";
                    for(i = 0; i<triggers.length; i += 1){
                        startConditions = self.mastParser.getTriggerStartConditions(triggers[i]);
                        for(j = 0; j<startConditions.length; j += 1){
                            positionStart = self.mastParser.getConditionPosition(startConditions[j]);
                        }
                        endConditions = self.mastParser.getTriggerEndConditions(triggers[i]);
                        for(j = 0; j<endConditions.length; j += 1){
                            positionEnd = self.mastParser.getConditionPosition(endConditions[j]);
                        }
                        sources = self.mastParser.getTriggerSources(triggers[i]);
                        var uri = self.mastParser.getSourceUri(sources[0]);
                        var newCue = new Cue(positionStart, positionStart+1, theAds.length);
                        newCue.onenter = listener;
                        track.addCue(newCue);
						theAds[theAds.length] = uri;
                    }
                }
        });
};