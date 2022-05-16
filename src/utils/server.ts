// This file is part of the @egomobile/next-utils distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/next-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/next-utils is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { IncomingMessage, ServerResponse } from "http";
import type { ValidationError as JoiValidationError } from "joi";
import { apiResponse } from "../api";
import type { IWithResponseExtensions } from "../types";

/**
 * Options for 'createResponseExtensions()' function.
 */
export interface ICreateResponseExtensionsOptions {
    /**
     * The request context.
     */
    request: IncomingMessage;
    /**
     * The response context.
     */
    response: ServerResponse;
}

/**
 * Creates a new object with basic response extensions.
 *
 * @param {ICreateResponseExtensionsOptions} options The options.
 *
 * @returns {IWithResponseExtensions} The new object.
 */
export function createResponseExtensions(options: ICreateResponseExtensionsOptions): IWithResponseExtensions {
    const { request, response } = options;

    return {
        "sendConflict": (message = "Conflict") => {
            apiResponse(request, response)
                .noSuccess()
                .addMessage({
                    "code": 40901,
                    "type": "error",
                    "internal": true,
                    message
                })
                .withStatus(409)
                .send();
        },
        "sendData": (data) => {
            apiResponse(request, response)
                .withData(data)
                .send();
        },
        "sendForbidden": () => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(403)
                .addMessage({
                    "code": 40301,
                    "type": "error",
                    "message": "Forbidden",
                    "internal": true
                })
                .send();
        },
        "sendList": (items) => {
            apiResponse(request, response)
                .withList({
                    items
                })
                .send();
        },
        "sendNoContent": () => {
            if (!response.headersSent) {
                response.writeHead(204, {
                    "Content-Length": "0"
                });
            }

            response.end();
        },
        "sendNotFound": (message = "Not Found") => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(404)
                .addMessage({
                    "code": 40401,
                    "type": "error",
                    message,
                    "internal": true
                })
                .send();
        },
        "sendValidationError": (
            validationError: JoiValidationError,
        ) => {
            apiResponse(request, response)
                .noSuccess()
                .addMessage({
                    "code": 40001,
                    "type": "error",
                    "internal": true,
                    "message": validationError.message
                })
                .withStatus(400)
                .send();
        }
    };
}

export * from "@egomobile/node-utils";
