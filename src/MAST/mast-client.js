AdsPlayer.dependencies.MastClient = function(adsplayer) {
    'use strict';
    this.mastLoader = new AdsPlayer.dependencies.MastLoader();
    this.mastParser = new AdsPlayer.dependencies.MastParser();
    this.video = null;
	this.ads = null;
	this.adsPlayer = adsplayer;
};

AdsPlayer.dependencies.MastClient.prototype = {
    constructor: AdsPlayer.dependencies.MastClient
};

AdsPlayer.dependencies.MastClient.prototype.start = function(url, video, listener) {
    var self = this;
    var Cue = window.VTTCue || window.TextTrackCue;

    self.video = video;
	

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
                    var track = video.addTextTrack("chapters", "ads", "none");
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

						self.adsPlayer.listAds[self.adsPlayer.listAds.length] = [uri,positionStart,0];
                     }
                    // sort elements by date
                    self.adsPlayer.listAds.sort(function(a,b){
                        if (a[1]< b[1])
                            return -1;
                        else if (a[1] > b[1])
                            return 1;
                        else 
                            return 0;
                    })

                    // create cues according to the sorted ads
                    for(var i=0;i<self.adsPlayer.listAds.length;i++)
                    {
                        var newCue = new Cue(self.adsPlayer.listAds[i][1], self.adsPlayer.listAds[i][1]+1, i);
                        newCue.onenter = listener;
                        track.addCue(newCue);
                        self.adsPlayer.getVast(self.adsPlayer.listAds[i][0], i);

                   }
                    // add an event to the video element
                    var event= new CustomEvent('mastCompleted');    
                    video.dispatchEvent(event);           
                }
        });
};