			
			var hasVideoPlayer = document.getElementById("videoPlayer");
			var vLength;
			var globalVideoUrl=null;      // global variable used to store the video url passed via the html client.

			//  display video duration when available
			hasVideoPlayer.addEventListener("loadedmetadata", function () {
			vLength = hasVideoPlayer.duration.toFixed(1);
			document.getElementById("vLen").textContent = vLength; // global variable
			}, false);
			//  display the current and remaining times
			hasVideoPlayer.addEventListener("timeupdate", function () {
				//  Current time  
				var vTime = hasVideoPlayer.currentTime;
				document.getElementById("curTime").textContent = vTime.toFixed(1);
				document.getElementById("vRemaining").textContent = (vLength - vTime).toFixed(1);
			}, false);


			var orangeHasPlayer = new OrangeHasPlayer();
			var url = "http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest";

 			var adsPlayer = new AdsPlayer(hasVideoPlayer);
			orangeHasPlayer.init(hasVideoPlayer);
//			orangeHasPlayer.setDebug(true);

//          listen to ads to be played.
            hasVideoPlayer.addEventListener('playAd', 
			function(e){
				var that=this;
				console.log('will play add :'+e.detail);
				
				var _playAd = function() {
					console.log("<video> do pause");
					that.pause();
					adsPlayer.playAd(e.detail);
					};
					
				var	_onplay = function() {
						that.removeEventListener("play", _onplay);
						_playAd();
					};
				console.log("<video> cue");
				console.log("<video> paused = " + this.paused);
				if (this.paused) {
					this.addEventListener("play", _onplay);
				} else {
					_playAd();
				}
			}
			, false);
			
            hasVideoPlayer.addEventListener('endAd', 
			function(){
				this.play();
			}
			, false);

/*
			a listenner is added so that the videoplayer is activated once the mast file is processed
*/
            hasVideoPlayer.addEventListener('mastCompleted', 
			function(){
			    var vid = document.getElementById("videoPlayer");
			    adsPlayer.setNumOfCues();
				vid.onseeked = function() {
			    	adsPlayer.seekedHandler();
			    };
				orangeHasPlayer.load(globalVideoUrl);
				console.log(" new HAS video has been loaded");
			}
			, false);

			loadFiles = function(videoUrl,mastUrl, vastUrl){
				
				adsPlayer.reset();
				clearVideosAdsCues();
				globalVideoUrl=videoUrl;
				adsPlayer.start(mastUrl, vastUrl);
			};
/*
	clearVideosAdsCues() is added to allow for new videos to be launched with its own cues
	i.e. previous cues (if any) are cleared.
*/			
			function clearVideosAdsCues() {
			    var v = document.getElementById("videoPlayer")

			    var textTracks = v.textTracks; // one for each track element
			    for (var c=0;c<textTracks.length;c++)
			    {
				    var textTrack = textTracks[c]; 
				    if(textTrack.label=='ads'){
					    var cues = textTrack.cues;
					    for (var i=cues.length-1;i>=0;i--) {
					        textTrack.removeCue(cues[i]);
					    }
					}
				}
			};


		