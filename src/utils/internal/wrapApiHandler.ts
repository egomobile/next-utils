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

import type { NextApiHandler } from "next";
import type { ApiMiddleware, MiddlewareNextFunction } from "../../types";
import type { Nilable } from "../../types/internal";

export interface IWrapApiHandlerOptions {
    use?: Nilable<ApiMiddleware[]>;
}

export function wrapApiHandler<TResponse = any>(
    handler: NextApiHandler<TResponse>,
    options?: Nilable<IWrapApiHandlerOptions>
): NextApiHandler<TResponse> {
    const middlewares = (options?.use || [])
        .filter((mw) => {
            return typeof mw === "function";
        });

    if (!middlewares.length) {
        return handler;  // nothing to wrap
    }

    return (request, response) => {
        return new Promise((resolve, reject) => {
            let i = -1;

            const next: MiddlewareNextFunction = (error?) => {
                if (error) {
                    reject(error);
                }
                else {
                    try {
                        const mw = middlewares[++i];
                        if (mw) {
                            Promise.resolve(mw(request, response, next))
                                .catch(reject);
                        }
                        else {
                            Promise.resolve(handler(request, response))
                                .then(resolve)
                                .catch(reject);
                        }
                    }
                    catch (error) {
                        reject(error);
                    }
                }
            };

            next();
        });
    };
}
