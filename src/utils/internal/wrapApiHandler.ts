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
