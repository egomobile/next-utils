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
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { Nilable } from "../types/internal";
import type { ServerMiddleware } from "../types";
import { wrapServerHandler } from "../utils/internal/wrapServerHandler";


/**
 * Function that enhances a server context.
 *
 * @param {TContext} context The context to anhance.
 */
export type EnhanceServerContext<TContext = IWithServerPropsActionContext> =
    (context: TContext) => void | PromiseLike<void>;

/**
 * Options for `createWithServerProps()` function.
 */
export interface ICreateWithServerPropsOptions<TContext = IWithServerPropsActionContext> {
    /**
     * The optional and custom function, that enhances the `TContext` based object.
     */
    enhanceContext?: Nilable<EnhanceServerContext<TContext>>;
}

/**
 * A context for a `WithServerPropsAction` action.
 */
export interface IWithServerPropsActionContext {
    /**
     * The Next.js context.
     */
    nextContext: GetServerSidePropsContext;
}

/**
 * Additional options for `withServerProps()` function.
 */
export interface IWithServerPropsOptions {
    /**
     * One or more middlewares to use.
     */
    use: Nilable<ServerMiddleware[]>;
}

/**
 * An action for a `withServerProps()` call.
 *
 * @param {IWithServerPropsActionContext} context The context.
 */
export type WithServerPropsAction<TContext = IWithServerPropsActionContext> = (
    context: TContext,
) => Promise<GetServerSidePropsResult<any>>;

/**
 * A function, which generates which generates a `GetServerSideProps` function
 * that is used for SSR rendered pages in Next.js.
 *
 * @param {Nilable<WithServerPropsAction>} [action] The optional and custom action to execute on the server.
 * @param {Partial<Nilable<IWithServerPropsOptions>>} [options] Custom options, like middlewares.
 *
 * @returns {GetServerSideProps} The new function.
 */
export type WithServerPropsFactory<TContext = IWithServerPropsActionContext> = (
    action?: Nilable<WithServerPropsAction<TContext>>,
    options?: Partial<Nilable<IWithServerPropsOptions>>
) => GetServerSideProps;

/**
 * Creates a new factory, which generates a `GetServerSideProps` function
 * that is used for SSR rendered pages in Next.js.
 *
 * @param {Nilable<ICreateWithServerPropsOptions>} [createOptions] Custom options.
 *
 * @returns {WithServerPropsFactory} The new factory function.
 */
export function createWithServerProps<TContext = IWithServerPropsActionContext>(
    createOptions?: Nilable<ICreateWithServerPropsOptions<TContext>>
): WithServerPropsFactory<TContext> {
    return (action?, options?) => {
        if (!action) {
            return wrapServerHandler(async () => {
                return {
                    "props": {}
                };
            }, {
                "use": options?.use
            });
        }

        const enhanceContext = createOptions?.enhanceContext ?
            asAsync<EnhanceServerContext<TContext>>(createOptions?.enhanceContext) :
            null;

        return wrapServerHandler(async (context) => {
            try {
                const actionContext = {
                    "nextContext": context
                } as unknown as TContext;

                await enhanceContext?.(actionContext);

                return await action(actionContext);
            }
            catch (error: any) {
                context.res.statusCode = 500;
                context.res.end(`[${error?.name}] ${error?.message}

${error?.stack}`);

                return {
                    "props": {}
                };
            }
        }, {
            "use": options?.use
        });
    };
}
