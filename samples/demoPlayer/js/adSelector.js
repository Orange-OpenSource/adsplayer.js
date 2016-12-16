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

class AdSelector {
    constructor(jsonAdsDescription){
        this.ads_data = JSON.parse(jsonAdsDescription);
        if (!this.ads_data)
            throw "Can't parse streams";

        this.select = document.getElementById("ad_type");
        if (!this.select)
            throw "Can't find selector in DOM";

        for (var i = 0; i < this.ads_data.length; i++) {
            var option = document.createElement("option");
            option.text = this.ads_data[i].name;
            this.select.add(option);
        }
    }

    onSelect(element) {

        if(element.value === "Custom"){
            document.getElementById("ad_url").disabled = "";
        }
        else{
            document.getElementById("ad_url").disabled = "disabled";
        }

        // update the document
        document.getElementById("ad_url").value = this.ads_data[this.select.selectedIndex].url;
    }

    getSelected() {

        if(this.select.value === "Custom"){
            return new Ad(
                {
                    name: "Custom",
                    url : document.getElementById("ad_url").value
                }
            );
        }
        else {
            return new Ad(this.ads_data[this.select.selectedIndex]);
        }
    }

    /** Returns the url of the stream */
    getUrl() {
        return this.ads_data[this.select.selectedIndex].url;
    }
}