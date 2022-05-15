/* eslint-disable @typescript-eslint/naming-convention */

declare module "http" {
    export interface IncomingMessage {
        /*
         * Read body data.
         */
        body?: any;
    }
}
