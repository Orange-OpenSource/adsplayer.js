
/*
* The copyright in this software module is being made available under the BSD License, included
* below. This software module may be subject to other third party and/or contributor rights,
* including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2016, Orange
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted
* provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright notice, this list of conditions
*   and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright notice, this list of
*   conditions and the following disclaimer in the documentation and/or other materials provided
*   with the distribution.
* - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
*   products derived from this software module without specific prior written permission.
*
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
* IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
* FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
* WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

export interface Event {
    /** The event type */
    type: EventTypes,

    /** The event data. Refer to each event type ({@link EventTypes}) to get the data object properties description */
    data?: object
}

export enum EventTypes {
    
    /**
     * The 'start' event is fired when the playback of ad(s) is starting.
     * When the 'start' event is fired, the application shall hide the main player component and
     * display the ads player container in which the ad media player component(s) will be created
     * and displayed.
     * <br/>Event data properties:
     * @event START
     * @property <b>currentTime</b>: number - the main video element current time
     * @property <b>ended</b>: boolean - the main video element ended state (true in case of end-roll ad)
     */
    START = 'start',

    /**
     * The 'end' event is fired when the playback of ad(s) has ended.
     * When the 'end' event is fired, the application shall display the main player component and
     * hide the ads player container.
     * @event END
     */
    END = 'end',

    /**
     * The 'addElement' event is fired when a DOM element for playing an ad has been created
     * and appended in the ads player container.
     * The element can be either a &lt;video&gt; or an &lt;img&gt; element.
     * <br/>Event data properties:
     * @event ADD_ELEMENT
     * @property <b>element</b>: HTMLElement - the created element
     * @property <b>type</b>: string - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
     */
    ADD_ELEMENT = 'addElement',

    /**
     * The 'removeElement' event is fired when the DOM element for playing an ad is being removed
     * from the ads player container and deleted.
     * <br/>Event data properties:
     * @event REMOVE_ELEMENT
     * @property <b>element</b>: HTMLElement - the removed element
     * @property <b>type</b>: string - the type of the element, 'video' for &lt;video&gt; or 'image' for &lt;img&gt;
     */
    REMOVE_ELEMENT = 'removeElement',

    /**
     * The 'play' event is fired when the playback of media ad is starting.
     * @event PLAY
     */
    PLAY = 'play',

    /**
     * The 'pause' event is fired when the playback of an ad is paused.
     * @event PAUSE
     */
    PAUSE = 'pause',

    /**
     * The 'timeChanged' event is fired when the current ad playback time changed.
     * @event TIME_CHANGED
     * @property <b>currentTime</b>: number - the current time
     */
    TIME_CHANGED = 'timeChanged',

    /**
     * The 'click' event is fired when a click has been performed on the ad component.
     * When the 'click' event is fired, the application shall open the web page with the provided URI.
     * <br/>Event data properties:
     * @event CLICK
     * @property <b>uri</b>: string - the web page uri
     */
    CLICK = 'click',

    /**
     * The error event is fired when an error occurs.
     * <br/>Event data properties:
     * @event ERROR
     * @property <b>code</b>: number - the error code
     * @property <b>message</b>: string - the error message
     * @property <b>data</b>: object -  error additionnal data
     */
    ERROR = 'error'
}
