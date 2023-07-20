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

import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import type { Nilable } from "../types/internal";
import type { ServerMiddleware } from "../types";
import { wrapServerHandler } from "../utils/internal/wrapServerHandler";


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
export type WithServerPropsAction = (
    context: IWithServerPropsActionContext,
) => Promise<GetServerSidePropsResult<any>>;

/**
 * A function, which generates which generates a `GetServerSideProps` function
 * that is used for SSR rendered pages in Next.js.
 *
 * @param {Nilable<WithServerPropsAction>} [action] The optional and custom action to execute on the server.
 * @param {Partial<Nilable<IWithServerPropsOptions>>} [options] Custom options, like middlewares.
 */
export type WithServerPropsFactory = (
    action?: Nilable<WithServerPropsAction>,
    options?: Partial<Nilable<IWithServerPropsOptions>>
) => GetServerSideProps;

/**
 * Creates a new factory, which generates a `GetServerSideProps` function
 * that is used for SSR rendered pages in Next.js.
 *
 * @returns {WithServerPropsFactory} The new factory function.
 */
export function createWithServerProps(): WithServerPropsFactory {
    return (action?, options?) => {
        return wrapServerHandler(async (context) => {
            try {
                if (!action) {
                    return {
                        "props": {}
                    };
                }

                return action({
                    "nextContext": context
                });
            }
            catch (error: any) {
                context.res.statusCode = 500;
                context.res.end(`${error?.stack}`);

                return {
                    "props": {}
                };
            }
        }, {
            "use": options?.use
        });
    };
}
