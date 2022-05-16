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

import { asAsync, isNil, toStringSafe } from "@egomobile/nodelike-utils";
import type { IncomingMessage, ServerResponse } from "http";
import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { ISessionCheckerContext, ISessionPermissionCheckerPredicateContext, Nilable, Optional, OverwritableFilterExpressionFunctions, RequestErrorHandler, RequestFailedHandler, RequestValidationErrorHandler, SessionChecker, SessionPermissionChecker } from "../types";
import { createFilterExpressionFunctions } from "../utils";
import { toRequestValidationErrorHandlerSafe, toSessionCheckerSafe, toSessionPermissionCheckPredicateSafe } from "../utils/internal";
import { NextApiResponseBuilder } from "./nextApiResponseBuilder";
import type { AnySchema } from "joi";

/**
 * Options for 'createWithApiProps()' function.
 */
export interface ICreateWithApiPropsOptions<TSession extends any = any> {
    /**
     * A custom function, which checks for a session.
     */
    checkSession?: Nilable<SessionChecker<TSession>>;
    /**
     * A list of global, custom filter functions, which should be added, removed or updated.
     */
    customFilterFunctions?: Nilable<OverwritableFilterExpressionFunctions>;
    /**
     * A custom function, which handles 400 Bad Request responses.
     */
    onBadRequest?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles 500 Internal Server Error responses.
     */
    onError?: Nilable<RequestErrorHandler>;
    /**
     * A custom function, which handles 403 Forbidden responses.
     */
    onForbidden?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles 405 Method Not Allowed responses.
     */
    onMethodNotAllowed?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles 404 Not Found responses.
     */
    onNotFound?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles 401 Unauthorized responses.
     */
    onUnauthorized?: Nilable<RequestFailedHandler>;
    /**
     * A custom function, which handles failed validation of input data.
     */
    onValidationFailed?: Nilable<RequestValidationErrorHandler>;
}

interface IToWithApiPropsActionOptions {
    actionOrActionOptions: WithApiPropsActionValue<any>;
    onBadRequest: RequestFailedHandler;
    onMethodNotAllowed: RequestFailedHandler;
    onNotFound: RequestFailedHandler;
    onValidationFailed: RequestValidationErrorHandler;
}

/**
 * Context for a 'WithApiPropsAction' function.
 */
export interface IWithApiPropsActionContext<TSession extends any = any, TResponse extends any = any> {
    /**
     * Props for the PI action.
     */
    props: WithApiPropsActionProps;
    /**
     * The request context.
     */
    request: NextApiRequest;
    /**
     * The response context.
     */
    response: NextApiResponse<TResponse>;
    /**
     * The underlying session, if available.
     */
    session: Nilable<TSession>;
}

/**
 * Bundles a list of actions, grouped by HTTP methods.
 */
export interface IWithApiPropsActionOptions<TResponse extends any = any> {
    /**
     * The action for a CONNECT request.
     */
    CONNECT?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
    /**
     * The action for a DELETE request.
     */
    DELETE?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
    /**
     * The action for a GET request.
     */
    GET?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
    /**
     * A function, which returns
     */
    getProps?: Nilable<WithApiPropsActionOptionsGetPropsAction>;
    /**
     * The action for a v request.
     */
    HEAD?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
    /**
     * The action for a OPTIONS request.
     */
    OPTIONS?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
    /**
     * The action for a PATCH request.
     */
    PATCH?: Nilable<WithApiPropsActionOrOptionsWithBody<TResponse>>;
    /**
     * The action for a POST request.
     */
    POST?: Nilable<WithApiPropsActionOrOptionsWithBody<TResponse>>;
    /**
     * The action for a PUT request.
     */
    PUT?: Nilable<WithApiPropsActionOrOptionsWithBody<TResponse>>;
    /**
     * The action for a TRACE request.
     */
    TRACE?: Nilable<WithApiPropsActionOrOptions<TResponse>>;
}

/**
 * Custom and optional options for a 'WithApiProps' function.
 */
export interface IWithApiPropsOptions<TSession extends any = any> {
    /**
     * A custom function, which checks for enough permission in a session.
     */
    checkPermission?: Nilable<SessionPermissionChecker<TSession>>;
    /**
     * A list of, custom filter functions, which should be added, removed or updated.
     */
    customFilterFunctions?: Nilable<OverwritableFilterExpressionFunctions>;
}

/**
 * Wraps an API action to ensure to run in a valid user session, e.g..
 *
 * @param {WithApiPropsActionValue<TResponse>} actionOrActionOptions The action(s) to invoke.
 * @param {Nilable<IWithApiPropsOptions>} [options] Custom and optional options.
 *
 * @returns {NextApiHandler<TResponse>} The handler to use.
 */
export type WithApiProps<TSession extends any = any, TResponse extends any = any> = (
    actionOrActionOptions: WithApiPropsActionValue<TResponse>,
    options?: Nilable<IWithApiPropsOptions>,
) => NextApiHandler<TResponse>;

/**
 * Action for 'withApiProps()' function.
 *
 * @param {IWithApiPropsActionContext<TResponse>} context The current execution context.
 */
export type WithApiPropsAction<TResponse extends any = any> = (
    context: IWithApiPropsActionContext<TResponse>,
) => Promise<any>;

export type WithApiPropsActionOrOptions<TResponse extends any = any> = WithApiPropsAction<TResponse> | {
    action: WithApiPropsAction<TResponse>;
};

export type WithApiPropsActionOrOptionsWithBody<TResponse extends any = any> =
    WithApiPropsAction<TResponse> | {
        action: WithApiPropsAction<TResponse>;
        schema?: Nilable<AnySchema>;
    };

/**
 * Action for an 'IWithApiPropsActionOptions' instance.
 *
 * @param {IWithApiPropsActionContext<any>} context The underlying context.
 *
 * @returns {WithApiPropsActionOptionsGetPropsResult} The result.
 */
export type WithApiPropsActionOptionsGetPropsAction = (
    context: IWithApiPropsActionContext<any>,
) => WithApiPropsActionOptionsGetPropsResult;

/**
 * A possible value for an error result of a 'WithApiPropsActionOptionsGetPropsAction' result.
 */
export type WithApiPropsActionOptionsGetPropsErrorResultValue = true | string;

/**
 * A result of a 'WithApiPropsActionOptionsGetPropsAction'.
 */
export type WithApiPropsActionOptionsGetPropsResult =
    | WithApiPropsActionOptionsGetPropsResultValue
    | PromiseLike<WithApiPropsActionOptionsGetPropsResultValue>;

/**
 * A possible value for a result of a 'WithApiPropsActionOptionsGetPropsAction'.
 */
export type WithApiPropsActionOptionsGetPropsResultValue =
    | { props: WithApiPropsActionProps; }
    | { badRequest: WithApiPropsActionOptionsGetPropsErrorResultValue; }
    | { notFound: WithApiPropsActionOptionsGetPropsErrorResultValue; };

/**
 * Props for a 'WithApiPropsActionProps'.
 */
export type WithApiPropsActionProps = Record<string, any>;

/**
 * Possible value for a first argument of 'withApiProps()' function.
 */
export type WithApiPropsActionValue<TResponse extends any = any> =
    | WithApiPropsAction<TResponse>
    | IWithApiPropsActionOptions<TResponse>;

/**
 * Creates a new builder for an API response.
 *
 * @param {IncomingMessage} request The request context.
 * @param {ServerResponse} response The response context.
 *
 * @returns {NextApiResponseBuilder} The new instance.
 */
export function apiResponse(
    request: IncomingMessage,
    response: ServerResponse,
): NextApiResponseBuilder {
    return new NextApiResponseBuilder(request, response);
}

/**
 * Creates a new 'WithApiProps' middleware.
 *
 * @param {ICreateWithApiPropsOptions<TSession>} [options] Custom options.
 *
 * @returns {WithApiProps} The new middleware.
 */
export function createWithApiProps<TSession extends any = any>(
    options?: ICreateWithApiPropsOptions<TSession>
): WithApiProps<TSession> {
    if (!isNil(options?.customFilterFunctions)) {
        if (typeof options?.customFilterFunctions !== "object") {
            throw new TypeError("options.customFilterFunctions must be of type object");
        }
    }

    const checkSession = toSessionCheckerSafe(options?.checkSession);
    const onBadRequest = toRequestFailedHandlerSafe(options?.onBadRequest);
    const onError = toRequestErrorHandlerSafe(options?.onError);
    const onForbidden = toRequestFailedHandlerSafe(options?.onForbidden);
    const onMethodNotAllowed = toRequestFailedHandlerSafe(options?.onMethodNotAllowed);
    const onNotFound = toRequestFailedHandlerSafe(options?.onNotFound);
    const onUnauthorized = toRequestFailedHandlerSafe(options?.onUnauthorized);
    const onValidationFailed = toRequestValidationErrorHandlerSafe(options?.onValidationFailed);

    const globalCustomFilterFunctions = {
        ...(options?.customFilterFunctions ?? {})
    };

    return (actionOrActionOptions, options?) => {
        const action = toWithApiPropsAction({
            actionOrActionOptions,
            onBadRequest,
            onMethodNotAllowed,
            onNotFound,
            onValidationFailed
        });

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

        return async (request, response) => {
            try {
                const sessionCheckerContext: ISessionCheckerContext = {
                    filters,
                    request,
                    response
                };

                const session = await checkSession(sessionCheckerContext);
                if (session !== false) {
                    const permissionCheckerContext: ISessionPermissionCheckerPredicateContext<TSession> = {
                        request,
                        response,
                        session
                    };

                    const isPermissionGranted = await checkPermission(permissionCheckerContext);
                    if (isPermissionGranted) {
                        await action({
                            "props": {},
                            request,
                            response,
                            session
                        });
                    }
                    else {
                        // not enough permission

                        await onForbidden({
                            request,
                            response,
                            "statusCode": 403,
                            "statusText": "Forbidden"
                        });
                    }
                }
                else {
                    // invalid session

                    await onUnauthorized({
                        request,
                        response,
                        "statusCode": 401,
                        "statusText": "Unauthorized"
                    });
                }
            }
            catch (ex: any) {
                await onError({
                    "error": ex,
                    request,
                    response,
                    "statusCode": 500,
                    "statusText": "Internal Server Error"
                });
            }
        };
    };
}

function toWithApiPropsAction({ actionOrActionOptions, onBadRequest, onMethodNotAllowed, onNotFound, onValidationFailed }: IToWithApiPropsActionOptions): WithApiPropsAction<any> {
    if (typeof actionOrActionOptions === "function") {
        return actionOrActionOptions;
    }

    const getProps =
        actionOrActionOptions.getProps ??
        (() => {
            return { "props": {} };
        });

    // eslint-disable-next-line consistent-return
    return async (context) => {
        const { request, response } = context;
        const { body } = request;

        const method =
            (context.request.method ?? "").toUpperCase().trim() || "GET";

        const actionOrOptions: Nilable<WithApiPropsActionOrOptionsWithBody<any>> = (
            actionOrActionOptions as any
        )[method];

        let action: Nilable<WithApiPropsAction>;
        let schema: Nilable<AnySchema>;

        if (!isNil(actionOrOptions)) {
            if (typeof actionOrOptions === "function") {
                action = actionOrActionOptions as Nilable<WithApiPropsAction>;
            }
            else if (typeof actionOrOptions === "object") {
                action = actionOrOptions.action;
                schema = actionOrOptions.schema;
            }
        }

        if (typeof action === "function") {
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

                    return;
                }
            }

            const propsResult = await Promise.resolve(getProps(context));

            const badRequest: Optional<string | true> = (propsResult as any).badRequest;
            const notFound: Optional<string | true> = (propsResult as any).notFound;

            if (notFound) {
                await onNotFound({
                    request,
                    response,
                    "statusCode": 404,
                    "statusText": "Not Found"
                });
            }
            else if (badRequest) {
                await onBadRequest({
                    request,
                    response,
                    "statusCode": 400,
                    "statusText": "Bad Request"
                });
            }
            else {
                // write props to context ...
                context.props = (propsResult as any).props ?? context.props;

                // ... before invoke action
                return action(context);
            }
        }
        else {
            // no matching action found
            // for current HTTP method

            await onMethodNotAllowed({
                request,
                response,
                "statusCode": 405,
                "statusText": "Method Not Allowed"
            });
        }
    };
}

function toRequestErrorHandlerSafe(handler: Nilable<RequestErrorHandler>): RequestErrorHandler {
    if (isNil(handler)) {
        handler = async ({ error, request, response, statusCode, statusText }) => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(statusCode)
                .addMessage({
                    "code": statusCode * 100,  // 500 => 50000
                    "type": "error",
                    "message": `[${statusText}] ${toStringSafe(error)}`,
                    "internal": true
                })
                .send();
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
        handler = async ({ request, response, statusCode, statusText }) => {
            apiResponse(request, response)
                .noSuccess()
                .withStatus(statusCode)
                .addMessage({
                    "code": statusCode * 100,  // 403 => 40300
                    "type": "error",
                    "message": statusText,
                    "internal": true
                })
                .send();
        };
    }
    else {
        if (typeof handler !== "function") {
            throw new TypeError("handler must be of type function");
        }
    }

    return asAsync(handler);
}

export * from "./nextApiResponseBuilder";
