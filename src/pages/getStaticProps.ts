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

import { asAsync, isNil } from "@egomobile/nodelike-utils";
import type { Nilable, Optional } from "@egomobile/types";
import type { GetStaticProps, GetStaticPropsContext, GetStaticPropsResult, Redirect } from "next";
import type { RevalidateProp } from "../types";

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
        props: Optional<any>;
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

/**
 * Holds defaults for result props of 'getStaticProps' functions.
 */
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
