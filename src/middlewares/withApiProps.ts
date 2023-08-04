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

import { asAsync } from "@egomobile/node-utils";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { ValidationError as JoiValidationError } from "joi";
import type { ApiMiddleware, IServerErrorHandlerContext, ServerErrorHandler } from "../types";
import type { List, Nilable, Nullable, Optional } from "../types/internal";
import { apiResponse } from "../utils/server/apiResponse";
import { wrapApiHandler } from "../utils/internal/wrapApiHandler";
import { asError } from "../utils/internal/asError";


/**
 * Function that enhances an API context.
 *
 * @param {IEnhanceApiContextContext<TContext, TResponse>} context The execution context.
 */
export type EnhanceApiContext<TContext = IGetApiPropsActionContext<any>, TResponse = any> =
    (context: IEnhanceApiContextExecutionContext<TContext, TResponse>) => void | PromiseLike<void>;

/**
 * An action for a `getProps` value of an `IWithApiPropsOptions` instance.
 */
export type GetApiPropsAction<TContext = IGetApiPropsActionContext<any>> = (context: TContext) => GetApiPropsActionResult;

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
 * Options for `createWithApiProps()` function.
 */
export interface ICreateWithApiPropsOptions<TContext = IGetApiPropsActionContext<any>> {
    /**
     * The optional and custom function, that enhances the `TContext` based object.
     */
    enhanceContext?: Nilable<EnhanceApiContext<TContext>>;
    /**
     * Custom and additional error handler.
     */
    onError?: Nilable<ServerErrorHandler>;
}

/**
 * Context for an `EnhanceApiContext` function.
 */
export interface IEnhanceApiContextExecutionContext<TContext = IGetApiPropsActionContext<any>, TResponse = any> {
    /**
     * The context to enhance.
     */
    context: TContext;
    /**
     * The options.
     */
    options: Nullable<Partial<IWithApiPropsOptions<TContext, TResponse>>>;
    /**
     * Gets or sets if the execution should be stopped or not.
     *
     * @default `false`
     */
    shouldStop: boolean;
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
    /**
     * Sends a standarized API 409 response.
     *
     * @param {string} [message] The custom message. Default: 'Conflict'
     */
    sendConflict: (message?: string) => void;
    /**
     * Sends a standarized API response for a forbidden resource.
     */
    sendForbidden: () => void;
    /**
     * Sends data on a standarized way.
     *
     * @param {any} data The data to send.
     * @param {number} [code=200] The custom response status code.
     */
    sendData: (data: any, code?: number) => void;
    /**
     * Sends an standarized API response for a list.
     *
     * @param {List<any>} items The items to send.
     * @param {number} [code=200] The custom response status code.
     */
    sendList: (items: List<any>, code?: number) => void;
    /**
     * Sends a 204 response.
     */
    sendNoContent: () => void;
    /**
     * Sends a standarized API 404 response.
     *
     * @param {string} [message] The custom message. Default: 'Not Found'
     */
    sendNotFound: (message: string) => void;
    /**
     * Sends an API response for a body validation error.
     *
     * @param {JoiValidationError} validationError The error information.
     */
    sendValidationError: (validationError: JoiValidationError) => void;
}

/**
 * Contains props.
 */
export interface IWithApiProps {
    /**
     * The stored props.
     */
    props: GetApiPropsActionProps;
}

/**
 * Options for a `withApiProps()` function call.
 */
export interface IWithApiPropsOptions<TContext = IGetApiPropsActionContext<any>, TResponse = any> {
    /**
     * The action for a CONNECT request.
     */
    CONNECT: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a DELETE request.
     */
    DELETE: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a GET request.
     */
    GET: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * A function which returns the props for all `WithApiPropsHandler`s.
     */
    getProps: GetApiPropsAction<TContext>;
    /**
     * The action for a HEAD request.
     */
    HEAD: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a OPTIONS request.
     */
    OPTIONS: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a PATCH request.
     */
    PATCH: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a POST request.
     */
    POST: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a PUT request.
     */
    PUT: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
    /**
     * The action for a TRACE request.
     */
    TRACE: Nilable<WithApiPropsHandler<TContext & IWithApiProps, TResponse>>;
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
export type WithApiPropsHandler<TContext = IGetApiPropsActionContext<any>, TResponse = any> =
    (context: TContext) => PromiseLike<TResponse>;

/**
 * A function, which generates which generates a `NextApiHandler<TResponse>` function
 * that is used for API endpoints in Next.js.
 *
 * @param {Partial<IWithApiPropsOptions>} options Custom options, like middlewares.
 *
 * @returns {NextApiHandler<TResponse>} The new function.
 */
export type WithApiPropsFactory<TContext = IGetApiPropsActionContext<any>> =
    <TResponse = any>(options: Partial<IWithApiPropsOptions<TContext, TResponse>>) => NextApiHandler<TResponse>;


/**
 * Creates a new factory, which generates a `NextApiHandler<TResponse>` function
 * that is used for API endpoints in Next.js.
 *
 * @param {Nilable<ICreateWithApiPropsOptions>} [createOptions] Custom options.
 *
 * @returns {WithApiPropsFactory} The new factory function.
 */
export function createWithApiProps<TContext = IGetApiPropsActionContext<any>>(
    createOptions?: Nilable<ICreateWithApiPropsOptions<TContext>>
): WithApiPropsFactory<TContext> {
    const enhanceContext = createOptions?.enhanceContext ?
        asAsync<EnhanceApiContext<TContext>>(createOptions.enhanceContext) :
        null;
    const onError = createOptions?.onError ?
        asAsync<ServerErrorHandler>(createOptions.onError) :
        null;

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
                        response,
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
                        "sendData": (data, code = 200) => {
                            apiResponse(request, response)
                                .withStatus(code)
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
                        "sendList": (items, code = 200) => {
                            apiResponse(request, response)
                                .withStatus(code)
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
                        "sendValidationError": (validationError: JoiValidationError) => {
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
                    const copyOfOptions = options ? {
                        ...options
                    } : null;

                    const enhanceExecCtx: IEnhanceApiContextExecutionContext<TContext, any> = {
                        "context": getPropsContext as any,
                        "options": copyOfOptions as any,
                        "shouldStop": false
                    };

                    await enhanceContext?.(enhanceExecCtx);
                    if (enhanceExecCtx.shouldStop) {
                        return;
                    }

                    const propsResult: any = await getProps(enhanceExecCtx.context as unknown as TContext);

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
                        const handlerContext = {
                            ...enhanceExecCtx.context,

                            "props": propsResult.props
                        } as unknown as (TContext & IWithApiProps);

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
                error = asError(error);

                const errorCtx: IServerErrorHandlerContext = {
                    error,
                    "executeDefault": true,
                    request,
                    response
                };

                await onError?.(errorCtx);

                if (errorCtx.executeDefault) {
                    apiResponse(request, response)
                        .noSuccess()
                        .withStatus(500)
                        .addMessage({
                            "code": 500,
                            "type": "error",
                            "message": `[${error?.name}] ${error?.message}

${error?.stack}`,
                            "internal": true
                        })
                        .send();
                }
            }
        });
    };
}
