export declare class AdsPlayer {
    private adsPlayerController;
    private logger;
    private eventBus;
    private error;
    private onErrorListener;
    constructor();
    /**
    * Returns the plugin name.
    * @return {string} the plugin name
    */
    getName(): string;
    /**
    * Initializes the plugin.
    * @param {HTMLMediaElement} video - the main video player
    * @param {HTMLElement} adsPlayerContainer - the HTML element that will contains ad media element
    * @param {boolean} handleMainPlayerPlayback - true (by default) if AdsPlayer shall handle the main video playback state
    */
    init(video: HTMLMediaElement, adsPlayerContainer: HTMLElement, handleMainPlayerPlayback?: boolean): void;
    /**
    * This method is invoked when a new stream is to be loaded/opened.
    * @param {object} stream - the stream contaning all stream informations (url, protData, adsUrl)
    */
    load(stream: object): Promise<{}>;
    /**
    * This method is invoked when the current stream is to be stopped.
    */
    stop(): void;
    /**
    * This method is invoked when the player is to be reset.
    */
    reset(): void;
    /**
    * This method is invoked when this plugin is being removed/destroyed.
    */
    destroy(): void;
    /**
    * Returns the plugin version.
    * @return {string} the plugin version
    */
    getVersion(): string;
    /**
    * Returns the full plugin version, including git revision
    * @return {string} the full plugin version, including git revision
    */
    getVersionFull(): string;
    /**
    * Returns the build date.
    * @return {string} the build date
    */
    getBuildDate(): string;
    /**
    * Plays/resumes the playback of the current ad.
    */
    play(): void;
    /**
    * Pauses the playback of the current ad.
    */
    pause(): void;
    /**
    * Registers a listener on the specified event. See {@link Event} for the syntax of the events
    * and {@link EventTypes} for the types of event that can be raised.
    * @param {string} type - the event type for listen to
    * @param {callback} listener - the callback which is called when an event of the specified type occurs
    */
    addEventListener(type: string, listener: any): void;
    /**
    * Unregisters the listener previously registered with the addEventListener() method.
    * @param {string} type - the event type on which the listener was registered
    * @param {callback} listener - the callback which was registered to the event type
    */
    removeEventListener(type: string, listener: any): void;
    /**
    * Returns the Error object for the most recent error.
    * @return {object} the Error object for the most recent error, or null if there has not been an error
    */
    getError(): any;
    /**
    * Enables or disables log messages.
    * @return {boolean} enable - true to enable log messages, false otherwise
    */
    enableLogs(enable: any): void;
    private onError;
}
