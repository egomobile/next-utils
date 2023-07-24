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
import type { ApiMiddleware } from "../types";
import type { Nilable, Optional } from "../types/internal";
import { wrapApiHandler } from "../utils/internal/wrapApiHandler";
import { apiResponse } from "../utils/server/apiResponse";


/**
 * Function that enhances an API context.
 *
 * @param {TContext} context The context to anhance.
 */
export type EnhanceApiContext<TContext = IGetApiPropsActionContext<any>> =
    (context: TContext) => void | PromiseLike<void>;

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
        asAsync<EnhanceApiContext<TContext>>(createOptions?.enhanceContext) :
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
                        response
                    };

                    await enhanceContext?.(getPropsContext as unknown as TContext);

                    const propsResult: any = await getProps(getPropsContext as unknown as TContext);

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
                            ...getPropsContext,

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
