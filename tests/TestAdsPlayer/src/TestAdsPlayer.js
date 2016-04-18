			
			var hasVideoPlayer    = document.getElementById("videoPlayer");		
			var adsVideoContainer = document.getElementById("VideoModule");			// container for the ads video player
			var adsVideoPlayer    = null;
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



			// video Players
			var orangeHasPlayer = new OrangeHasPlayer();   // main video Player
 			var adsPlayer = new AdsPlayer();			   // Ads video Player


 			// init
 			var Init = function(videoUrl,mastUrl)  {
 				orangeHasPlayer.init(hasVideoPlayer);		   
				adsPlayer.init(hasVideoPlayer,adsVideoContainer);
           		adsPlayer.addEventListener('mastLoaded', function(){
						console.log("<TestAdsPlayer:Init> Mast parsing completed");
						/*
					    var vid = document.getElementById("videoPlayer");
					    adsPlayer.setNumOfCues();
						vid.onseeked = function() {
					    	adsPlayer.seekedHandler();
					    };
					    */
			    		adsVideoPlayer= document.getElementById("adsVideoPlayer");	
						orangeHasPlayer.load(videoUrl);
						console.log("<TestAdsPlayer:Init> New HAS video has been loaded");
					}
					, false);
           		adsPlayer.load(mastUrl);
		 	};



		 	// just for testing purpose
			var Play = function(videoUrl)  {
 				adsPlayer.playAd(videoUrl);		   
 			};


		 	// listeners to manage ads 

		 	// a ad is about to start
           adsPlayer.addEventListener('adStart', 
			function(){
				hasVideoPlayer.style.visibility = 'hidden';
				adsVideoPlayer.style.visibility = 'visible';
				console.log( 'mainVideo :' + hasVideoPlayer.style.visibility );
				console.log( 'adsVideo  :' + adsVideoPlayer.style.visibility );
			}
			, false);

		 	// a ad has finished
           adsPlayer.addEventListener('adEnd', 
			function(){
				hasVideoPlayer.style.visibility = 'visible';
				adsVideoPlayer.style.visibility = 'hidden';
				console.log( 'mainVideo :' + hasVideoPlayer.style.visibility );
				console.log( 'adsVideo  :' + adsVideoPlayer.style.visibility );
			}
			, false);

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

			function displayVideosAdsCues() {
			    var v = document.getElementById("videoPlayer")

			    var textTracks = v.textTracks; // one for each track element
			    for (var c=0;c<textTracks.length;c++)
			    {
				    var textTrack = textTracks[c]; 
				    if(textTrack.label=='ads'){
					    var cues = textTrack.cues;
					    for (var i=0;i<cues.length;++i) {
					        console.log('<adsPlayerDemo:displayVideosAdsCues> cue #'+i+'  at '+cues[i].startTime+' sec');
					    }
					}
				}
			};

		