/*
 * The copyright in this software module is being made available under the BSD License, included
 * below. This software module may be subject to other third party and/or contributor rights,
 * including patent rights, and no such rights are granted under this license.
 *
 * Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list of conditions
 *   and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 * - Neither the name of VIACCESS S.A and/or ORCA Interactive nor the names of its contributors may
 *   be used to endorse or promote products derived from this software module without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 * WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

class WebPlayer {

    constructor(adsPlugin) {

        this.mediaPlayer = new MediaPlayer();

        this.mediaPlayer.init(document.getElementById('videoplayer-container'));
        
        this.mediaPlayer.setDebug(false);
        
        this.mediaPlayer.setInitialQualityFor('video', 0);
        this.mediaPlayer.setInitialQualityFor('audio', 0);

        // Load plugins
        if (adsPlugin) {
            this.mediaPlayer.addPlugin(adsPlugin);
        }

        // TODO: get the browser language
        this.mediaPlayer.setDefaultAudioLang('fra');
        this.mediaPlayer.setDefaultSubtitleLang('fre');
        this.mediaPlayer.enableSubtitles(false);
        document.getElementById('cswebplayer_version').textContent += " " + this.mediaPlayer.getVersion();
    }

    /**
     * Start to play a stream. Optionaly, an ad may be provided
     * @method play
     * @access public
     * @memberof WebPlayer#
     * @param {Stream} stream - the stream to play
     * @param {Ad} ad - the ad to play
     *
     */
    play(stream,ad) {
        var protData = new Array();
        
		var licencerUrlValue = document.getElementById("licencerUrl").value;
		var licencerDrmValue = document.getElementById("licencerDrm").value;
		var streamIndex = document.getElementById("stream_type").selectedIndex;
		var licencerCustomDataValue = document.getElementById("licencerCustomData").value;
		
		//If Licencer is manually set, it overrides the value setted in config.json
		if(streamIndex === 0 && licencerUrlValue != "" && licencerUrlValue != null && typeof(licencerUrlValue) != "undefined"){
			protData[licencerDrmValue] = new Array();
			protData[licencerDrmValue].laURL = licencerUrlValue;
			
			if(licencerCustomDataValue != "" && licencerCustomDataValue != null && typeof(licencerCustomDataValue) != "undefined"){
				protData[licencerDrmValue].cdmData = licencerCustomDataValue;
			}
		}
		else{
			for (var i = 0; i < stream.getNumberOfLicensers(); i++){
				protData[stream.getLicenserDrmType(i)] = new Array();
				protData[stream.getLicenserDrmType(i)].laURL = stream.getLicenserUrl(i);
			}
		}

        var stream = {
            url : stream.getUrl(),
            protData : protData,
            adsUrl : ad.getUrl()
        };

        this.mediaPlayer.load(stream);
    }

    /**
     * Selects the audio track to be playbacked.
     * @method selectAudio
     * @access public
     * @memberof WebPlayer#
     * @param {Track} id - the id of the language of audio track to select
     *
     */
    selectAudio(id){
        var audios = this.getAudios();
        for (var i = 0; i < audios.length; i++) {
            if (audios[i].id == id) {
                this.mediaPlayer.selectTrack(MediaPlayer.TRACKS_TYPE.AUDIO,audios[i]);
            }
        }
    }

    /**
     * Returns the list of available audio tracks.
     * @method getAudios
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the available audio tracks.
     */
    getAudios(){
        return this.mediaPlayer.getTracks(MediaPlayer.TRACKS_TYPE.AUDIO);
    }
    
    /**
     * Returns the current audio track.
     * @method getAudio
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the current audio track.
     */
    getAudio(){
        if  (this.mediaPlayer.getSelectedTrack(MediaPlayer.TRACKS_TYPE.AUDIO))
            return this.mediaPlayer.getSelectedTrack(MediaPlayer.TRACKS_TYPE.AUDIO);
        else
            return {id : 'none', lang : 'none'};
    }
    
    /**
     * Selects the subtitle track to be playbacked.
     * @method selectSubtitle
     * @access public
     * @memberof WebPlayer#
     * @param {Track} id - the id of the language of subtitle track to select
     *
     */
    selectSubtitle(id){
    	if (id === 'none'){
    		this.mediaPlayer.enableSubtitles(false);
            this.mediaPlayer.enableSubtitleExternDisplay(false);
    	}
    	else {
            let subtitles = this.getSubtitles();
	        for (let i = 0; i < subtitles.length; i++) {
	            if (subtitles[i].id == id) {
                    // Enable subtitle
	                this.mediaPlayer.enableSubtitles(true);
                    
                    // Select subtitle track
                    this.mediaPlayer.selectTrack(MediaPlayer.TRACKS_TYPE.TEXT,subtitles[i]);
                    break;
	            }
	        }
    	}
    }

    /**
     * Returns the list of available subtitle tracks.
     * @method getSubtitles
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the available subtitle tracks.
     */
    getSubtitles(){
    	var noSub = {id : 'none', lang : 'none'};
    	var tracks = this.mediaPlayer.getTracks(MediaPlayer.TRACKS_TYPE.TEXT);
        tracks.splice(0,0,noSub); // Add a no subtitle track at index 0
        return tracks;
    }
    
    /**
     * Returns the current subtitle track.
     * @method getSubtitle
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the current subtitle track.
     */
    getSubtitle(){
        if  (this.mediaPlayer.getSelectedTrack(MediaPlayer.TRACKS_TYPE.TEXT))
            return this.mediaPlayer.getSelectedTrack(MediaPlayer.TRACKS_TYPE.TEXT);
        else
            return {id : 'none', lang : 'none'};
    }
    
    /**
     * Returns the list of available video bitrates.
     * @method getVideoBitrates
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Number>} the available video bitrates. The first bitrate is automatic.
     */
    getVideoBitrates(){
        var vbrList = this.mediaPlayer.getVideoBitrates();
        vbrList.splice(0,0,'automatic'); // Add 'automatic' vbr at index 0
        return vbrList;
    }
    
    /**
     * Returns the current video bitrate.
     * @method getVideoBitrate
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Number>} the current video bitrate as an index of the list provided by {@link WebPlayer#getVideoBitrates}.
     */
    getVideoBitrate(){
        if (this.mediaPlayer.getAutoSwitchQuality())
            return 0;
        else return (this.mediaPlayer.getQualityFor('video') + 1);
    } 
    
    /**
     * Set the current video bitrate.
     * @method getVideoBitrate
     * @access public
     * @memberof WebPlayer#
     * @param {number} value - the video bitrate to set as an index of the list provided by {@link WebPlayer#getVideoBitrates}.
     */    
    setVideoBitrate(value){
        if (value === 0){
            this.mediaPlayer.setAutoSwitchQuality(true);
        } else {
            this.mediaPlayer.setAutoSwitchQuality(false);
            this.mediaPlayer.setQualityFor('video',value - 1);
        }
    } 

}
