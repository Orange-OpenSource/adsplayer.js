/**
* Date prorotype extension
*/
declare global {
    interface Date {
        HHMMSSmmm(): string;
        MMSSmmm(): string;
    }
}
export declare enum LOG_LEVEL {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    ALL = 4
}
export declare class Logger {
    private static instance;
    level: LOG_LEVEL;
    showTimestamp: boolean;
    showElapsedTime: boolean;
    startTime: Date;
    logger: any;
    static getInstance(): Logger;
    constructor();
    getLevel(): LOG_LEVEL;
    setLevel(value: LOG_LEVEL): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    getStringLevel(level: any): "" | "ERROR" | "WARN" | "INFO" | "DEBUG";
    prepareLog(logLevel: any, ...args: any[]): string;
    log(logLevel: LOG_LEVEL, ...args: any[]): void;
}
