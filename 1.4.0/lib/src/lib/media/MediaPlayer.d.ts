import * as vast from '../vast/model/Vast';
export interface MediaPlayer {
    load(baseUrl: string, mediaFiles: vast.MediaFile[]): any;
    getType(): string;
    getElement(): HTMLElement;
    addEventListener(type: string, listener: any): any;
    removeEventListener(type: string, listener: any): any;
    setDuration(duration: number): any;
    getDuration(): number;
    getCurrentTime(): number;
    setVolume(volume: number): any;
    getVolume(): number;
    play(): any;
    pause(): any;
    stop(): any;
    reset(): any;
    isEnded(): boolean;
}
