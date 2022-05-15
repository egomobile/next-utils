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
import type { Nilable } from "@egomobile/types";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { ISessionCheckerContext, ISessionPermissionCheckerPredicateContext, RequestErrorHandler, RequestFailedHandler, SessionChecker, SessionPermissionChecker } from "../types";
import { toSessionCheckerSafe, toSessionPermissionCheckPredicateSafe } from "../utils/internal";

/**
 * Options for 'createWithServerSideProps()' function.
 */
export interface ICreateWithServerSidePropsOptions<TSession extends any = any> {
    /**
     * A custom function, which checks for a session.
     */
    checkSession?: Nilable<SessionChecker<TSession>>;
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
}

/**
 * A context for a 'WithServerSidePropsAction' function.
 */
export interface IWithServerSidePropsActionContext<TSession extends any = any> {
    /**
     * The Next.js context.
     */
    nextContext: GetServerSidePropsContext;
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
     * A custom function, which checks for enough permission in a session.
     */
    checkPermission?: Nilable<SessionPermissionChecker<TSession>>;
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
 * @param {ICreateWithServerSidePropsOptions} [options] Custom options.
 *
 * @returns {WithServerSideProps} The new middleware.
 */
export function createWithServerSideProps<TSession extends any = any>(
    options: ICreateWithServerSidePropsOptions<TSession> = {}
): WithServerSideProps<TSession> {
    const checkSession = toSessionCheckerSafe(options.checkSession);

    const onError = toRequestErrorHandlerSafe(options.onError);
    const onForbidden = toRequestFailedHandlerSafe(options.onForbidden);
    const onUnauthorized = toRequestFailedHandlerSafe(options.onUnauthorized);

    return (action?, options?) => {
        const checkPermission = toSessionPermissionCheckPredicateSafe(options?.checkPermission);

        return async (nextContext) => {
            const request = nextContext.req;
            const response = nextContext.res;

            try {
                const sessionCheckerContext: ISessionCheckerContext = {
                    request,
                    response
                };

                const session = await checkSession!(sessionCheckerContext);
                if (session !== false) {
                    const permissionCheckerContext: ISessionPermissionCheckerPredicateContext<TSession> = {
                        request,
                        response,
                        session
                    };

                    const isPermissionGranted = await checkPermission(permissionCheckerContext);
                    if (isPermissionGranted) {
                        if (action) {
                            return action({
                                nextContext,
                                session
                            });
                        }

                        return {
                            "props": {}
                        };
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
