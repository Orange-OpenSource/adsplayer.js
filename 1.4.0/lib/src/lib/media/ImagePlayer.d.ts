/**
* The ImagePlayer is a MediaPlayer implementation for playing still images.
*/
import * as vast from '../vast/model/Vast';
import { MediaPlayer } from './MediaPlayer';
export declare class ImagePlayer implements MediaPlayer {
    private uri;
    private image;
    private duration;
    private currentTime;
    private ended;
    private listeners;
    private timerInterval;
    private timerTime;
    private events;
    private logger;
    constructor();
    load(baseUrl: string, mediaFiles: vast.MediaFile[]): boolean;
    getType(): string;
    getElement(): HTMLElement;
    addEventListener(type: string, listener: any): void;
    removeEventListener(type: string, listener: any): void;
    setDuration(duration: number): void;
    getDuration(): number;
    getCurrentTime(): number;
    setVolume(volume: number): void;
    getVolume(): number;
    play(): void;
    pause(): void;
    stop(): void;
    reset(): void;
    isEnded(): boolean;
    private getListeners;
    private addEventListener_;
    private removeEventListener_;
    private notifyEvent;
    private updateCurrentTime;
    private startTimer;
    private stopTimer;
}
export default ImagePlayer;
