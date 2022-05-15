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

import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import type { Nilable, Optional } from "../types";
import { NextApiResponseBuilder } from "./NextApiResponseBuilder";

/**
 * Options for 'createWithApiProps()' function.
 */
export interface ICreateWithApiPropsOptions {
}

/**
 * Context for a 'WithApiPropsAction' function.
 */
export interface IWithApiPropsActionContext<TResponse extends any = any> {
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
}

/**
 * Bundles a list of actions, grouped by HTTP methods.
 */
export interface IWithApiPropsActionOptions<TResponse extends any = any> {
    /**
     * The action for a CONNECT request.
     */
    CONNECT?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a DELETE request.
     */
    DELETE?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a GET request.
     */
    GET?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * A function, which returns
     */
    getProps?: Nilable<WithApiPropsActionOptionsGetPropsAction>;
    /**
     * The action for a v request.
     */
    HEAD?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a OPTIONS request.
     */
    OPTIONS?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a PATCH request.
     */
    PATCH?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a POST request.
     */
    POST?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a PUT request.
     */
    PUT?: Nilable<WithApiPropsAction<TResponse>>;
    /**
     * The action for a TRACE request.
     */
    TRACE?: Nilable<WithApiPropsAction<TResponse>>;
}

/**
 * Custom and optional options for a 'WithApiProps' function.
 */
export interface IWithApiPropsOptions {
}

/**
 * Wraps an API action to ensure to run in a valid user session, e.g..
 *
 * @param {WithApiPropsActionValue<TResponse>} actionOrActionOptions The action(s) to invoke.
 * @param {Nilable<IWithApiPropsOptions>} [options] Custom and optional options.
 *
 * @returns {NextApiHandler<TResponse>} The handler to use.
 */
export type WithApiProps<TResponse extends any = any> = (
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
 * @param {NextApiRequest} request The request context.
 * @param {NextApiResponse<any>} response The response context.
 *
 * @returns {NextApiResponseBuilder} The new instance.
 */
export function apiResponse(
    request: NextApiRequest,
    response: NextApiResponse<any>,
): NextApiResponseBuilder {
    return new NextApiResponseBuilder(request, response as any);
}

/**
 * Creates a new 'WithApiProps' middleware.
 *
 * @param {ICreateWithApiPropsOptions} [options] Custom options.
 *
 * @returns {WithApiProps} The new middleware.
 */
export function createWithApiProps(options: ICreateWithApiPropsOptions = {}): WithApiProps {
    return (actionOrActionOptions, options?) => {
        const action = toWithApiPropsAction(actionOrActionOptions);

        return async (request, response) => {
            try {
                await action({
                    "props": {},
                    request,
                    response
                });
            }
            catch (ex: any) {
                apiResponse(request, response)
                    .noSuccess()
                    .withStatus(500)
                    .addMessage({
                        "code": 500,
                        "type": "error",
                        "message": `${ex}\n\n${ex?.stack}`,
                        "internal": true
                    })
                    .send();
            }
        };
    };
}

function toWithApiPropsAction(
    actionOrActionOptions: WithApiPropsActionValue<any>,
): WithApiPropsAction<any> {
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
        const method =
            (context.request.method ?? "").toUpperCase().trim() || "GET";

        const action: Nilable<WithApiPropsAction<any>> = (
            actionOrActionOptions as any
        )[method];

        if (typeof action === "function") {
            const propsResult = await Promise.resolve(getProps(context));

            const badRequest: Optional<string | true> = (propsResult as any).badRequest;
            const notFound: Optional<string | true> = (propsResult as any).notFound;

            if (notFound) {
                // 404 - Not Found

                apiResponse(context.request, context.response)
                    .noSuccess()
                    .withStatus(404)
                    .addMessage({
                        "code": 40400,
                        "type": "error",
                        "message":
                            typeof notFound === "string"
                                ? notFound
                                : "Not Found",
                        "internal": true
                    })
                    .send();
            }
            else if (badRequest) {
                // 400 - Bad Request

                apiResponse(context.request, context.response)
                    .noSuccess()
                    .withStatus(400)
                    .addMessage({
                        "code": 40000,
                        "type": "error",
                        "message":
                            typeof badRequest === "string"
                                ? badRequest
                                : "Bad Request",
                        "internal": true
                    })
                    .send();
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

            apiResponse(context.request, context.response)
                .noSuccess()
                .withStatus(405)
                .addMessage({
                    "code": 40500,
                    "type": "error",
                    "message": "Method Not Allowed",
                    "internal": true
                })
                .send();
        }
    };
}

export * from "./NextApiResponseBuilder";
