export declare enum ErrorCodes {
    /**
     * An error occured when downloading a MAST or VAST file
     * Error data properties:
     * @property <b>url</b>: string - the MAST or VAST file url
     * @property <b>status</b>: number - the response status code
     */
    DOWNLOAD_ERR_FILE = 1,
    /**
     * The downloaded MAST or VAST file is not in XML format
     * Error data properties:
     * @property <b>url</b>: string - the MAST or VAST file url
     */
    DOWNLOAD_ERR_NOT_XML = 2
}
export interface Error {
    /** The error code */
    code: ErrorCodes;
    /** The error message */
    message: string;
    /** The error data. Refer to each code to get the data object properties description */
    data?: object;
}
export declare const ErrorMessages: {};
