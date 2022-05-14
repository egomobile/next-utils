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

/**
 * Options for 'createWithServerSideProps()' function.
 */
export interface ICreateWithServerSidePropsOptions {
}

/**
 * A context for a 'WithServerSidePropsAction' function.
 */
export interface IWithServerSidePropsActionContext {
    /**
     * The Next.js context.
     */
    nextContext: GetServerSidePropsContext;
}

/**
 * Custom and optional options for a 'WithServerSideProps' function.
 */
export interface IWithServerSidePropsOptions {
}

/**
 * Action for a 'WithServerSideProps' function.
 */
export type WithServerSidePropsAction = (
    context: IWithServerSidePropsActionContext,
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
export type WithServerSideProps = (
    action?: Nilable<WithServerSidePropsAction>,
    options?: Nilable<IWithServerSidePropsOptions>,
) => GetServerSideProps<any>;

/**
 * Creates a new 'WithServerSideProps' middleware.
 *
 * @param {ICreateWithServerSidePropsOptions} [options] Custom options.
 *
 * @returns {WithServerSideProps} The new middleware.
 */
export function createWithServerSideProps(options: ICreateWithServerSidePropsOptions = {}): WithServerSideProps {
    return (action?, options?) => {
        return async (nextContext) => {
            try {
                if (action) {
                    return action({
                        nextContext
                    });
                }

                return {
                    "props": {}
                };
            }
            catch (ex: any) {
                nextContext.res.statusCode = 500;
                nextContext.res.end(`${ex?.stack}`);

                return {
                    "props": {}
                };
            }
        };
    };
}
