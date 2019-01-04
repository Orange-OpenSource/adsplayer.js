import { ErrorCodes } from '../Errors';
export declare class ErrorHandler {
    private static instance;
    private logger;
    private eventBus;
    static getInstance(): ErrorHandler;
    constructor();
    sendError(code: ErrorCodes, data: object): void;
}
