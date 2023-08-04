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

import { asAsync, toStringSafe } from "@egomobile/node-utils";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { Nilable, Nullable } from "../types/internal";
import type { IServerErrorHandlerContext, ServerErrorHandler, ServerMiddleware } from "../types";
import { wrapServerHandler } from "../utils/internal/wrapServerHandler";


/**
 * Function that enhances a server context.
 *
 * @param {TContext} context The context to anhance.
 *
 * @returns {false|void|PromiseLike<void|false>} The `false`, the execution will be stopped.
 */
export type EnhanceServerContext<TContext = IWithServerPropsActionContext, TResponse = any> =
    (context: TContext, options: Nullable<Partial<IWithServerPropsOptions>>) => false | void | PromiseLike<void | false>;

/**
 * Options for `createWithServerProps()` function.
 */
export interface ICreateWithServerPropsOptions<TContext = IWithServerPropsActionContext> {
    /**
     * The optional and custom function, that enhances the `TContext` based object.
     */
    enhanceContext?: Nilable<EnhanceServerContext<TContext>>;
    /**
     * Custom and additional error handler.
     */
    onError?: Nilable<ServerErrorHandler>;
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
    const enhanceContext = createOptions?.enhanceContext ?
        asAsync<EnhanceServerContext<TContext>>(createOptions?.enhanceContext) :
        null;
    const onError = createOptions?.onError ?
        asAsync<ServerErrorHandler>(createOptions.onError) :
        null;

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

        return wrapServerHandler(async (context) => {
            try {
                const actionContext: IWithServerPropsActionContext = {
                    "nextContext": context
                };
                const copyOfOptions = options ? {
                    ...options
                } : null;

                const shouldStop = ((await enhanceContext?.(actionContext as unknown as TContext, copyOfOptions)) as any) === false;
                if (shouldStop) {
                    return {
                        "props": {}
                    };
                }

                return await action(actionContext as unknown as TContext);
            }
            catch (ex: any) {
                let error = ex;
                if (!(error instanceof Error)) {
                    error = new Error(`UNCAUGHT ERROR: ${toStringSafe(error)}`);
                }

                const errorCtx: IServerErrorHandlerContext = {
                    error,
                    "executeDefault": true,
                    "request": context.req,
                    "response": context.res
                };

                await onError?.(errorCtx);

                if (errorCtx.executeDefault) {
                    const errorMsg = Buffer.from(
                        `[${error?.name}] ${error?.message}

${error?.stack}`, "utf8"
                    );

                    if (!context.res.headersSent) {
                        context.res.writeHead(500, {
                            "Content-Type": "text/plain; charset=UTF-8",
                            "Content-Length": String(errorMsg.length)
                        });
                    }

                    context.res.end(errorMsg);
                }

                return {
                    "props": {}
                };
            }
        }, {
            "use": options?.use
        });
    };
}
