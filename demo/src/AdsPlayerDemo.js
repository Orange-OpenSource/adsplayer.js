			
			var hasVideoPlayer = document.getElementById("videoPlayer");
			var vLength;
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


			loadFiles = function(videoUrl,mastUrl){
				adsPlayer.start(mastUrl);
			    orangeHasPlayer.load(videoUrl);
			    console.log(" new HAS video is being played");
			};
			
