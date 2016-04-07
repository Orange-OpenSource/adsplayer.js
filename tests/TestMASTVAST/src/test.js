/*
 * The copyright in this software module is being made available under the BSD License, included below. This software module may be subject to other third party and/or contributor rights, including patent rights, and no such rights are granted under this license.
 * The whole software resulting from the execution of this software module together with its external dependent software modules from dash.js project may be subject to Orange and/or other third party rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2014, Orange
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Orange nor the names of its contributors may be used to endorse or promote products derived from this software module without specific prior written permission.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/*jshint -W020 */
/*exported AdsPlayer*/

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], function() {
            root.AdsPlayer = factory();
            return root.AdsPlayer;
        });
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.AdsPlayer = factory();
    }
})

(this, function() {
    'use strict';
    var AdsPlayer = {};
	
    AdsPlayer = function() {
   		var that = this;

      this.mastFileContent="";

   		this.fileLoader = new AdsPlayer.FileLoader();
      this.fileLoader.errorHandler = new AdsPlayer.ErrorHandler();
      this.mastParser = new AdsPlayer.MastParser();
      this.eventBus = new AdsPlayer.EventBus();
      this.mastTriggers = [];

      this.fileLoader.debug = {};
      this.fileLoader.debug.log = function(debugText){  
           console.log(debugText);
      };

      this.parseMastFile = function() {
          if(that.mastFileContent !== ''){
              that.mastTriggers=that.mastParser.parse(that.mastFileContent);
          }
    
          if(that.mastTriggers !== []) {
              // here goes the code parsing the triggers'sources if in vast format
          }
      }
      
   	  this.loadMastUrl = function(url)
   		{
   			that.fileLoader.load(url).then(function(result){
            console.log("output from mast file loading : ");
            console.log("***************************************************");
            console.log(result.response);
            console.log("***************************************************");
            console.log('');
            that.mastFileContent=result.response;
            that.eventBus.dispatchEvent({
              type : "mastFileLoaded",
              data : {}
            });
        },function(reason){
            console.log(reason);
            alert(reason.message);
        });
   		}
    };

    AdsPlayer.prototype = {
        constructor: AdsPlayer
    };

    AdsPlayer.Mast = {};
    AdsPlayer.Mast.Trigger = {};
    AdsPlayer.Mast.Trigger.Condition = {};
    AdsPlayer.dependencies = {};
    AdsPlayer.utils = {};
    return AdsPlayer;
});



