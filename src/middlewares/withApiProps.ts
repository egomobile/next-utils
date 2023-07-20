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

import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { ApiMiddleware } from "../types";
import type { Nilable, Optional } from "../types/internal";
import { wrapApiHandler } from "../utils/internal/wrapApiHandler";
import { apiResponse } from "../utils/server/apiResponse";

/**
 * An action for a `getProps` value of an `IWithApiPropsOptions` instance.
 */
export type GetApiPropsAction = (context: IGetApiPropsActionContext) => GetApiPropsActionResult;

/**
 * Possible value for a `props` property of a non-error result of
 * a `GetApiPropsAction` action.
 */
export type GetApiPropsActionProps = Record<string, any>;

/**
 * Possible result value of a `GetApiPropsAction` call.
 */
export type GetApiPropsActionResult = PromiseLike<GetApiPropsActionResultValue>;

/**
 * Possible result value of a `GetApiPropsAction` call.
 */
export type GetApiPropsActionResultValue =
    | { props: GetApiPropsActionProps; }
    | { badRequest: GetApiPropsActionErrorResultValue; }
    | { notFound: GetApiPropsActionErrorResultValue; };

/**
 * Possible value for an "error prop" of a `GetApiPropsActionResultValue` instance.
 */
export type GetApiPropsActionErrorResultValue = true | string;

/**
 * A context for a `WithApiPropsHandler` function.
 */
export interface IWithApiPropsHandlerContext<TResponse = any> {
    /**
     * The props from a `getProps` call of a `GetApiPropsAction` action, if defined.
     */
    props: GetApiPropsActionProps;
    /**
     * The request context.
     */
    request: NextApiRequest;
    /**
     * The response context.
     */
    response: NextApiResponse<TResponse>;
}

/**
 * Context for a `GetApiPropsAction` action.
 */
export interface IGetApiPropsActionContext<TResponse = any> {
    /**
     * The request context.
     */
    request: NextApiRequest;
    /**
     * The response context.
     */
    response: NextApiResponse<TResponse>;
}

/**
 * Options for a `withApiProps()` function call.
 */
export interface IWithApiPropsOptions<TResponse = any> {
    /**
     * The action for a CONNECT request.
     */
    CONNECT: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a DELETE request.
     */
    DELETE: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a GET request.
     */
    GET: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * A function which returns the props for all `WithApiPropsHandler`s.
     */
    getProps: GetApiPropsAction;
    /**
     * The action for a HEAD request.
     */
    HEAD: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a OPTIONS request.
     */
    OPTIONS: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a PATCH request.
     */
    PATCH: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a POST request.
     */
    POST: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a PUT request.
     */
    PUT: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * The action for a TRACE request.
     */
    TRACE: Nilable<WithApiPropsHandler<TResponse>>;
    /**
     * One or more middlewares to use.
     */
    use: Nilable<ApiMiddleware[]>;
}

/**
 * A handler of a "method prop" instide an `IWithApiPropsOptions` instance.
 *
 * @param {IWithApiPropsHandlerContext<TResponse>} context The context.
 *
 * @returns {PromiseLike<TResponse>} The promise with the response data.
 */
export type WithApiPropsHandler<TResponse = any> =
    (context: IWithApiPropsHandlerContext<TResponse>) => PromiseLike<TResponse>;

export type WithApiPropsFactory<TResponse = any> =
    (options: Partial<IWithApiPropsOptions>) => NextApiHandler<TResponse>;

export function createWithApiProps(): WithApiPropsFactory {
    return (options) => {
        const getProps = options.getProps || (async () => {
            return {
                "props": {}
            };
        });

        return wrapApiHandler(async (request, response) => {
            try {
                const handler: Nilable<WithApiPropsHandler<any>> =
                    (options as any)[request.method?.toUpperCase().trim() || "GET"];

                if (typeof handler === "function") {
                    const getPropsContext: IGetApiPropsActionContext<any> = {
                        request,
                        response
                    };

                    const propsResult: any = await getProps(getPropsContext);

                    const badRequest = propsResult.badRequest as Optional<GetApiPropsActionErrorResultValue>;
                    const notFound = propsResult.notFound as Optional<GetApiPropsActionErrorResultValue>;

                    if (notFound) {
                        // 404 - Not Found

                        apiResponse(request, response)
                            .noSuccess()
                            .withStatus(404)
                            .addMessage({
                                "code": 40400,
                                "type": "error",
                                "message":
                                    typeof notFound === "string"
                                        ? notFound
                                        : "Not Found",
                                "internal": true
                            })
                            .send();
                    }
                    else if (badRequest) {
                        // 400 - Bad Request

                        apiResponse(request, response)
                            .noSuccess()
                            .withStatus(400)
                            .addMessage({
                                "code": 40000,
                                "type": "error",
                                "message":
                                    typeof badRequest === "string"
                                        ? badRequest
                                        : "Bad Request",
                                "internal": true
                            })
                            .send();
                    }
                    else {
                        const handlerContext: IWithApiPropsHandlerContext<any> = {
                            "props": propsResult.props,
                            request,
                            response
                        };

                        await handler(handlerContext);
                    }
                }
                else {
                    // 405 - Method Not Allowed

                    apiResponse(request, response)
                        .noSuccess()
                        .withStatus(405)
                        .addMessage({
                            "code": 40500,
                            "type": "error",
                            "message": "Method Not Allowed",
                            "internal": true
                        })
                        .send();
                }
            }
            catch (error: any) {
                apiResponse(request, response)
                    .noSuccess()
                    .withStatus(500)
                    .addMessage({
                        "code": 500,
                        "type": "error",
                        "message": `${error}\n\n${error?.stack}`,
                        "internal": true
                    })
                    .send();
            }
        });
    };
}
