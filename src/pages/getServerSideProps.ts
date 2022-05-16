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

import { readStream } from "@egomobile/node-utils";
import { asAsync, isNil, toStringSafe } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";
import { AnySchema, isSchema } from "joi";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { BodyParser, ISessionPermissionCheckerPredicateContext, OverwritableFilterExpressionFunctions, RequestErrorHandler, RequestFailedHandler, RequestValidationErrorHandler, SessionChecker, SessionPermissionChecker } from "../types";
import { createFilterExpressionFunctions } from "../utils";
import { toBodyParserSafe, toRequestValidationErrorHandlerSafe, toSessionCheckerSafe, toSessionPermissionCheckPredicateSafe } from "../utils/internal";

/**
 * Options for 'createWithServerSideProps()' function.
 */
export interface ICreateWithServerSidePropsOptions<TSession extends any = any> {
    /**
     * A custom function to parse the body.
     */
    bodyParser?: Nilable<BodyParser>;
    /**
     * A custom function, which checks for a session.
     */
    checkSession?: Nilable<SessionChecker<TSession>>;
    /**
     * A list of global, custom filter functions, which should be added, removed or updated.
     */
    customFilterFunctions?: Nilable<OverwritableFilterExpressionFunctions>;
    /**
     * A custom function, which handles 500 Internal Server Error responses.
     */
    onError?: Nilable<RequestErrorHandler>;
    /**
     * A custom function, which handles 403 Forbidden responses.
     */
    onForbidden?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles 401 Unauthorized responses.
     */
    onUnauthorized?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles failed validation of input data.
     */
    onValidationFailed?: Nilable<RequestValidationErrorHandler>;
}

/**
 * A context for a 'WithServerSidePropsAction' function.
 */
export interface IWithServerSidePropsActionContext<TSession extends any = any> {
    /**
     * The Next.js context.
     */
    nextContext: GetServerSidePropsContext<any>;
    /**
     * The underlying session.
     */
    session: TSession;
}

/**
 * Custom and optional options for a 'WithServerSideProps' function.
 */
export interface IWithServerSidePropsOptions<TSession extends any = any> {
    /**
     * A custom function to parse the body.
     */
    bodyParser?: Nilable<BodyParser>;
    /**
     * A custom function, which checks for enough permission in a session.
     */
    checkPermission?: Nilable<SessionPermissionChecker<TSession>>;
    /**
     * A list of global, custom filter functions, which should be added, removed or updated.
     */
    customFilterFunctions?: Nilable<OverwritableFilterExpressionFunctions>;
    /**
     * A custom schema to use, which validates the input.
     */
    schema?: Nilable<AnySchema>;
}

/**
 * Action for a 'WithServerSideProps' function.
 */
export type WithServerSidePropsAction<TSession extends any = any> = (
    context: IWithServerSidePropsActionContext<TSession>,
) => Promise<GetServerSidePropsResult<any>>;

/**
 * Creates a function for 'getServerSideProps' constant in a page,
 * which should be rendered on server.
 *
 * @param {Nilable<WithServerSidePropsAction>} [action] The optional action to invoke.
 * @param {Nilable<IWithPagePropsOptions>} [options] Custom and optional options.
 *
 * @returns {GetServerSideProps} The new function.
 */
export type WithServerSideProps<TSession extends any = any> = (
    action?: Nilable<WithServerSidePropsAction<TSession>>,
    options?: Nilable<IWithServerSidePropsOptions>,
) => GetServerSideProps<any>;

/**
 * Creates a new 'WithServerSideProps' middleware.
 *
 * @example
 * ```
 * import React from 'react'
 * import { createWithServerSideProps } from '@egomobile/next-utils'
 * import type { NextPage } from 'next'
 *
 * // this should maybe done in a central
 * // module of your application
 * const withServerSideProps = createWithServerSideProps();
 *
 * // tell Next.js to render this side
 * // on the server, before send it to client
 * export const getServerSideProps = withServerSideProps(async ({ nextContext }) => {
 *   return {
 *     props: {
 *       "foo": "buzz",
 *       "bar": 42
 *     }
 *   }
 * })
 *
 * interface IMyServerPageProps {
 *   foo: string;
 *   bar?: number;
 * }
 *
 * const MyServerPage: NextPage<IMyPageProps> = ({ foo, bar }) => {
 *   // ...
 * }
 *
 * export default MyServerPage
 * ```
 *
 * @param {ICreateWithServerSidePropsOptions} [options] Custom options.
 *
 * @returns {WithServerSideProps} The new middleware.
 */
export function createWithServerSideProps<TSession extends any = any>(
    options?: Nilable<ICreateWithServerSidePropsOptions<TSession>>
): WithServerSideProps<TSession> {
    const defaultBodyParser = toBodyParserSafe(options?.bodyParser);

    if (!isNil(options?.customFilterFunctions)) {
        if (typeof options?.customFilterFunctions !== "object") {
            throw new TypeError("options.customFilterFunctions must be of type object");
        }
    }

    const checkSession = toSessionCheckerSafe(options?.checkSession);

    const onError = toRequestErrorHandlerSafe(options?.onError);
    const onForbidden = toRequestFailedHandlerSafe(options?.onForbidden);
    const onUnauthorized = toRequestFailedHandlerSafe(options?.onUnauthorized);
    const onValidationFailed = toRequestValidationErrorHandlerSafe(options?.onValidationFailed);

    const globalCustomFilterFunctions = {
        ...(options?.customFilterFunctions ?? {})
    };

    return (action?, options?) => {
        const bodyParser = toBodyParserSafe(options?.bodyParser)
            ?? defaultBodyParser;

        const schema = options?.schema;
        if (!isNil(schema)) {
            if (!isSchema(schema)) {
                throw new TypeError("options.schema must be a valid Joi schema");
            }
        }

        if (isNil(action)) {
            action = async () => {
                return {
                    "props": {}
                };
            };
        }
        else {
            if (typeof action !== "function") {
                throw new TypeError("action must be of type function");
            }
        }

        action = asAsync(action);

        const customFilterFunctions: OverwritableFilterExpressionFunctions = {
            ...globalCustomFilterFunctions,
            ...(options?.customFilterFunctions ?? {})
        };

        const filters = createFilterExpressionFunctions({
            "overwrites": customFilterFunctions
        });

        const checkPermission = toSessionPermissionCheckPredicateSafe({
            "checker": options?.checkPermission,
            "customFilterExpressionFunctions": customFilterFunctions
        });

        return async (nextContext) => {
            const { "req": request, "res": response } = nextContext;

            if (bodyParser) {
                const body = await readStream(request);

                request.body = await bodyParser({
                    body,
                    request,
                    response
                });
            }

            const { body } = request;

            try {
                const session = await checkSession!({
                    filters,
                    request,
                    response
                });
                if (session !== false) {
                    const permissionCheckerContext: ISessionPermissionCheckerPredicateContext<TSession> = {
                        request,
                        response,
                        session
                    };

                    const isPermissionGranted = await checkPermission(permissionCheckerContext);
                    if (isPermissionGranted) {
                        if (schema) {
                            const validationResult = schema.validate(body);
                            if (validationResult.error) {
                                await onValidationFailed({
                                    "error": validationResult.error,
                                    request,
                                    response,
                                    "statusCode": 400,
                                    "statusText": "Bad Request"
                                });

                                return {
                                    "props": {}
                                };
                            }
                        }

                        return action!({
                            nextContext,
                            session
                        });
                    }
                    else {
                        await onForbidden({
                            request,
                            response,
                            "statusCode": 403,
                            "statusText": "Forbidden"
                        });

                        return {
                            "props": {}
                        };
                    }
                }
                else {
                    await onUnauthorized({
                        request,
                        response,
                        "statusCode": 401,
                        "statusText": "Unauthorized"
                    });

                    return {
                        "props": {}
                    };
                }
            }
            catch (ex: any) {
                await onError!({
                    "error": ex,
                    request,
                    response,
                    "statusCode": 500,
                    "statusText": "Internal Server Error"
                });

                return {
                    "props": {}
                };
            }
        };
    };
}

function toRequestErrorHandlerSafe(handler: Nilable<RequestErrorHandler>): RequestErrorHandler {
    if (isNil(handler)) {
        handler = async ({ error, response, statusCode, statusText }) => {
            response.statusCode = statusCode;
            response.statusMessage = statusText;

            response.end(Buffer.from(
                toStringSafe(error), "utf8"
            ));
        };
    }
    else {
        if (typeof handler !== "function") {
            throw new TypeError("handler must be of type function");
        }
    }

    return asAsync(handler);
}

function toRequestFailedHandlerSafe(handler: Nilable<RequestFailedHandler>): RequestFailedHandler {
    if (isNil(handler)) {
        handler = async ({ response, statusCode, statusText }) => {
            response.statusCode = statusCode;
            response.statusMessage = statusText;

            response.end();
        };
    }
    else {
        if (typeof handler !== "function") {
            throw new TypeError("handler must be of type function");
        }
    }

    return asAsync(handler);
}
