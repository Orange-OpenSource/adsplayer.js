export declare class TrackingEventsManager {
    private trackingEvents;
    private adMediaPlayer;
    private currentTime;
    private mute;
    private unmute;
    private debug;
    private eventListeners;
    constructor();
    /**
     * Initializes the TrackingEventsManager.
     * @method init
     * @access public
     * @memberof TrackingEventsManager#
     * @param {Array} trackingEvents - the array of tracking events to manage
     * @param {Object} adMediaPlayer - the ad media player
     */
    init(trackingEvents: any, adMediaPlayer: any): void;
    start(): void;
    stop(): void;
    private postEvent;
    private addEventListener;
    private addPlayerEventListeners;
    private removePlayerEventListeners;
}
export default TrackingEventsManager;
