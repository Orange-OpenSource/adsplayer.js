/**
* The AdPlayer manages the sequencing of playing creatives of a single Ad.
* It takes as input the Ad object as returned by the VAST parser.
* The AdPlayer plays sequentially all contained Creatives,
* with the help of a CreativePlayer.
*
* Dispatch events:
*  - 'adStart' when when the playback of the ad (first creative) is starting.
*  - 'adEnd' when the playback of the (all creatives) has ended
*/
import * as vast from './model/Vast';
export declare class AdPlayer {
    private ad;
    private adPlayerContainer;
    private mainVideo;
    private baseUrl;
    private creativeIndex;
    private creativePlayer;
    private logger;
    private eventBus;
    private onCreativeEndListener;
    /**
     * Initializes the AdPlayer
     * @method constructor
     * @access public
     * @memberof AdPlayer#
     */
    constructor();
    /**
     * Initializes the AdManager.
     * @method init
     * @access public
     * @memberof VastPlayerManager#
     * @param {Object} ad - the Ad to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - the base URL for media files
     */
    init(ad: vast.Ad, adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement, baseUrl: string): void;
    start(): void;
    play(): void;
    pause(): void;
    stop(): void;
    private sendImpressions;
    private onCreativeEnd;
    private pauseCreative;
    private resumeCreative;
    private stopCreative;
    private playCreative;
    private playNextCreative;
}
export default AdPlayer;
