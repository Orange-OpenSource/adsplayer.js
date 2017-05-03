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

class StreamSelector {
    constructor(jsonStreamsDescription){
        this.customStream="";
        this.streams = JSON.parse(jsonStreamsDescription);
        if (!this.streams)
            throw "Can't parse streams";

        this.select = document.getElementById("stream_type");
        if (!this.select)
            throw "Can't find selector in DOM";

        for (var i = 0; i < this.streams.length; i++) {
            var option = document.createElement("option");
            option.text = this.streams[i].name;
            this.select.add(option);
        }
    }

    onSelect(element) {
        // update the document
        document.getElementById("stream").value = this.streams[this.select.selectedIndex].url;
        
		if(this.select.selectedIndex === 0){
			document.getElementById("licencer").style.display = "table-row";
		}
		else{
			document.getElementById("licencer").style.display = "none";
		}
    }

    getSelected() {
        if (this.streams[this.select.selectedIndex].name == "custom"){
            return new Stream({name : "custom", "url" : document.getElementById("stream").value});
        }
        else{
            return new Stream(this.streams[this.select.selectedIndex]);
        }
    }
}
