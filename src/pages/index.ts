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
import type { Nilable, Optional } from "@egomobile/types";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult, GetStaticProps, GetStaticPropsContext, GetStaticPropsResult, Redirect } from "next";
import type { ISessionCheckerContext, ISessionPermissionCheckerPredicateContext, RequestErrorHandler, RequestFailedHandler, RevalidateProp, SessionChecker, SessionPermissionChecker } from "../types";
import { toSessionCheckerSafe, toSessionPermissionCheckPredicateSafe } from "../utils/internal";

/**
 * The default value for a prop of a 'getStaticProps' result
 * or the value, which returns it.
 */
export type DefaultStaticResultValueGetter<T> =
    ((context: IDefaultStaticResultValueGetterContext) => Nilable<T | PromiseLike<Nilable<T>>>);

/**
 * A possible value for something that returns a default value
 * for a prop for a static rendered page on a client.
 */
export type DefaultStaticResultValue<T> = T | DefaultStaticResultValueGetter<T>;

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
 * Options for 'createWithStaticProps()' function.
 */
export interface ICreateWithStaticPropsOptions extends IWithStaticPropsDefaults {
}

/**
 * A context for a 'DefaultStaticResultValueGetter' call.
 */
export interface IDefaultStaticResultValueGetterContext {
    /**
     * The Next.js context.
     */
    nextContext: GetStaticPropsContext<any>;
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
     * A custom function, which checks for enough permission in a session.
     */
    checkPermission?: Nilable<SessionPermissionChecker<TSession>>;
}

/**
 * Context for a 'WithStaticPropsAction' function.
 */
export interface IWithStaticPropsActionContext {
    /**
     * List of default / proposed values.
     */
    defaults: {
        /**
         * The default value for 'notFound' prop, if not defined in result.
         */
        notFound: Optional<boolean>;
        /**
         * The default value for 'props' prop, if not defined in result.
         */
        props: Optional<boolean>;
        /**
         * The default value for 'redirect' prop, if not defined in result.
         */
        redirect: Optional<Redirect>;
        /**
         * The default value for 'revalidate' prop, if not defined in result.
         */
        revalidate: Optional<RevalidateProp>;
    };
    /**
     * The Next.js context.
     */
    nextContext: GetStaticPropsContext<any>;
}

export interface IWithStaticPropsDefaults {
    /**
     * The global default value for 'notFound' prop of
     * a 'GetStaticProps' result.
     */
    notFound?: Nilable<DefaultStaticResultValue<boolean>>;
    /**
     * The global default value for 'props' prop of
     * a 'GetStaticProps' result.
     */
    props?: Nilable<DefaultStaticResultValue<any>>;
    /**
      * The global default value for 'redirect' prop of
      * a 'GetStaticProps' result.
      */
    redirect?: Nilable<DefaultStaticResultValue<Redirect>>;
    /**
      * The global default value for 'revalidate' prop of
      * a 'GetStaticProps' result.
      */
    revalidate?: Nilable<DefaultStaticResultValue<RevalidateProp>>;
}

/**
 * Options for a 'withStaticProps()' function.
 */
export interface IWithStaticPropsOptions extends IWithStaticPropsDefaults {
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
 * Creates a function for 'getStaticProps' constant in a page,
 * which should be rendered on client side.
 *
 * @param {Nilable<WithStaticPropsAction>} [action] The action to invoke.
 * @param {Nilable<IWithPagePropsOptions>} [options] Custom and optional options.
 *
 * @returns {GetStaticProps<any>} The new function.
 */
export type WithStaticProps
    = (action?: Nilable<WithStaticPropsAction>, options?: Nilable<IWithStaticPropsOptions>) => GetStaticProps<any>;

/**
 * Action for a 'WithStaticProps' function.
 */
export type WithStaticPropsAction = (context: IWithStaticPropsActionContext) => WithStaticPropsActionResult;

/**
 * Result of a 'WithStaticPropsAction' call.
 */
export type WithStaticPropsActionResult = GetStaticPropsResult<any> | PromiseLike<GetStaticPropsResult<any>>;

/**
 * Creates a new 'WithStaticProps' middleware.
 *
 * @example
 * ```
 * import React from 'react'
 * import { createWithStaticProps } from '@egomobile/next-utils'
 * import type { NextPage } from 'next'
 *
 * // this should maybe done in a central
 * // module of your application
 * const withStaticProps = createWithStaticProps();
 *
 * // tell Next.js to render this side
 * // on the client
 * export const getStaticProps = withStaticProps(async ({ nextContext }) => {
 *   return {
 *     props: {
 *       "foo": "buzz",
 *       "bar": 42
 *     }
 *   }
 * })
 *
 * interface IMyStaticPageProps {
 *   foo: string;
 *   bar?: number;
 * }
 *
 * const MyStaticPage: NextPage<IMyPageProps> = ({ foo, bar }) => {
 *   // ...
 * }
 *
 * export default MyStaticPage
 * ```
 *
 * @param {ICreateWithStaticPropsOptions} [options] Custom options.
 *
 * @returns {WithStaticProps} The new middleware.
 */
export function createWithStaticProps(options?: Nilable<ICreateWithStaticPropsOptions>): WithStaticProps {
    const {
        "getNotFound": getGlobalNotFound,
        "getProps": getGlobalProps,
        "getRedirect": getGlobalRedirect,
        "getRevalidate": getGlobalRevalidate
    } = toStaticPropsDefaultGetters(options);

    return (action, options?) => {
        if (isNil(action)) {
            action = async ({ defaults }) => {
                return {
                    ...defaults
                };
            };
        }
        else {
            if (typeof action !== "function") {
                throw new TypeError("action must be of type function");
            }
        }

        action = asAsync(action);

        const {
            "getNotFound": getDefaultNotFound,
            "getProps": getDefaultProps,
            "getRedirect": getDefaultRedirect,
            "getRevalidate": getDefaultRevalidate
        } = toStaticPropsDefaultGetters(options);

        return async (nextContext) => {
            const getterContext: IDefaultStaticResultValueGetterContext = {
                nextContext
            };

            const defaultRevalidate = await getDefaultRevalidate(getterContext) ??
                await getGlobalRevalidate(getterContext) ??
                undefined;
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const defaultNotFound = await getDefaultNotFound(getterContext) ??
                await getGlobalNotFound(getterContext) ??
                undefined;
            const defaultRedirect = await getDefaultRedirect(getterContext) ??
                await getGlobalRedirect(getterContext) ??
                undefined;
            const defaultProps = await getDefaultProps(getterContext) ??
                await getGlobalProps(getterContext) ??
                {};

            const defaults = {
                "notFound": defaultNotFound,
                "props": defaultProps,
                "redirect": defaultRedirect,
                "revalidate": defaultRevalidate
            };

            return action!({
                defaults,
                nextContext
            });
        };
    };
}

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
    options: ICreateWithServerSidePropsOptions<TSession> = {}
): WithServerSideProps<TSession> {
    const checkSession = toSessionCheckerSafe(options.checkSession);

    const onError = toRequestErrorHandlerSafe(options.onError);
    const onForbidden = toRequestFailedHandlerSafe(options.onForbidden);
    const onUnauthorized = toRequestFailedHandlerSafe(options.onUnauthorized);

    return (action?, options?) => {
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

function toStaticPropsDefaultGetters(options: Nilable<IWithStaticPropsDefaults>) {
    let getRedirect: DefaultStaticResultValueGetter<Redirect>;
    if (typeof options?.redirect === "function") {
        getRedirect = options.redirect;
    }
    else {
        getRedirect = async () => {
            return options?.redirect as Nilable<Redirect>;
        };
    }

    let getRevalidate: DefaultStaticResultValueGetter<RevalidateProp>;
    if (typeof options?.revalidate === "function") {
        getRevalidate = options.revalidate;
    }
    else {
        getRevalidate = async () => {
            return options?.revalidate as Nilable<RevalidateProp>;
        };
    }

    let getNotFound: DefaultStaticResultValueGetter<boolean>;
    if (typeof options?.notFound === "function") {
        getNotFound = options.notFound;
    }
    else {
        getNotFound = async () => {
            return options?.notFound as Nilable<boolean>;
        };
    }

    let getProps: DefaultStaticResultValueGetter<any>;
    if (typeof options?.props === "function") {
        getProps = options.props;
    }
    else {
        getProps = async () => {
            return options?.props as Nilable<any>;
        };
    }

    return {
        getNotFound,
        getProps,
        getRedirect,
        getRevalidate
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
