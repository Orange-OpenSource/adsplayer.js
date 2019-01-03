/**
* The VastPlayerManager manages the sequencing of playing ads of a single VAST.
* It takes as input the list of Vast objects as returned by the VAST parser.
* For each Vast, the VastPlayerManager plays sequentially all contained Ads,
* with the help of an AdPlayer.
*/
import * as vast from './model/Vast';
export declare class VastPlayerManager {
    private vasts;
    private adPlayerContainer;
    private mainVideo;
    private vastIndex;
    private adIndex;
    private adPlayer;
    private logger;
    private eventBus;
    private onAdEndListener;
    constructor();
    /**
     * Initializes the VastPlayerManager.
     * @method init
     * @access public
     * @memberof VastPlayerManager#
     * @param {Array} vasts - the array of Vast components to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     */
    init(vasts: vast.Vast[], adPlayerContainer: HTMLElement, mainVideo: HTMLMediaElement): void;
    start(): void;
    play(): void;
    pause(): void;
    stop(): void;
    private onAdEnd;
    private pauseAd;
    private resumeAd;
    private stopAd;
    private playAd;
    private playNextAd;
    private playVast;
    private playNextVast;
}
export default VastPlayerManager;
