/**
* The VideoPlayer is a MediaPlayer implementation for playing video files.
*/
import * as vast from '../vast/model/Vast';
import { MediaPlayer } from './MediaPlayer';
export declare class VideoPlayer implements MediaPlayer {
    private uri;
    private video;
    private logger;
    constructor();
    load(baseUrl: string, mediaFiles: vast.MediaFile[]): boolean;
    getType(): string;
    getElement(): HTMLMediaElement;
    addEventListener(type: string, listener: any): void;
    removeEventListener(type: string, listener: any): void;
    setDuration(duration: number): void;
    getDuration(): number;
    getCurrentTime(): number;
    getVolume(): number;
    setVolume(volume: number): void;
    play(): void;
    stop(): void;
    pause(): void;
    reset(): void;
    isEnded(): boolean;
    private isMediaSupported;
}
export default VideoPlayer;
