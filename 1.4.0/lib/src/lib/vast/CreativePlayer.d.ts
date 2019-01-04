/**
* The CreativePlayer manages:
* - the playing of media files within a Creative (with the help of a Image/VideoPlayer)
* - the tracking events (with the help of a TrackingEventsManager)
* - the display of the ad skipping component
* - the user clicks
*/
import * as vast from './model/Vast';
export declare class CreativePlayer {
    private adPlayerContainer;
    private mediaPlayer;
    private trackingEventsManager;
    private mainVideo;
    private logger;
    private eventBus;
    private onMediaPlayListener;
    private onMediaPauseListener;
    private onMediaErrorListener;
    private onMediaTimeupdateListener;
    private onMediaEndedListener;
    constructor();
    /**
     * Initializes the creative player.
     * @method init
     * @access public
     * @memberof CreativePlayer#
     * @param {Object} creative - the creative element to play
     * @param {Object} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - the base URL for media files
     */
    init(creative: vast.Linear, adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement, baseUrl: string): boolean;
    play(): void;
    pause(): void;
    stop(): void;
    private parseTime;
    private onMediaPlay;
    private onMediaPause;
    private onMediaError;
    private onMediaEnded;
    private onMediaTimeupdate;
    private onMainVideoVolumeChange;
    private onAdClick;
    private load;
    private play_;
    private pause_;
    private stop_;
}
