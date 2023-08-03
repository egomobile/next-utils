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

import { ApiResponseBuilder } from "@egomobile/api-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Describes a middleware for an API endpoint.
 *
 * @param {NextApiRequest} request The request context.
 * @param {NextApiResponse<any>} response The response context.
 * @param {MiddlewareNextFunction} next The next function.
 */
export type ApiMiddleware = (request: NextApiRequest, response: NextApiResponse<any>, next: MiddlewareNextFunction) => any;

/**
 * A context for a server error handler.
 */
export interface IServerErrorHandlerContext {
    /**
     * The thrown error.
     */
    error: any;
    /**
     * Also execute default logic or not.
     *
     * @default `true`
     */
    executeDefault: boolean;
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
 * A next function for a middleware.
 *
 * @param {any} [error] The error, if occurred.
 */
export type MiddlewareNextFunction = (error?: any) => any;

/**
 * An error handler.
 *
 * @param {IServerErrorHandlerContext} context The context.
 */
export type ServerErrorHandler = (context: IServerErrorHandlerContext) => any;

/**
 * Describes a middleware for an server rendered page.
 *
 * @param {NextApiRequest} request The request context.
 * @param {NextApiResponse<any>} response The response context.
 * @param {MiddlewareNextFunction} next The next function.
 */
export type ServerMiddleware = (
    request: IncomingMessage & { cookies: NextApiRequestCookies; },
    response: ServerResponse,
    next: MiddlewareNextFunction
) => any;

/**
 * Next.js version of `ApiResponseBuilder` class.
 */
export class NextApiResponseBuilder extends ApiResponseBuilder {
    /**
     * @inheritdoc
     */
    public constructor(request: any, response: any) {
        super({
            request,
            response,
            "executeEnd": true
        });
    }
}
