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

import type { Nilable, Optional } from "@egomobile/types";
import type { IncomingMessage, ServerResponse } from "http";
import type { ValidationError as JoiValidationError } from "joi";

/**
 * A body parser.
 *
 * @param {IBodyParserContext<TRequest, TResponse>} context The context.
 *
 * @returns {any} The value, which should be used in 'body' prop of request context.
 */
export type BodyParser<TRequest extends IncomingMessage = IncomingMessage, TResponse extends ServerResponse = ServerResponse>
    = (context: IBodyParserContext<TRequest, TResponse>) => any;

/**
 * A repository of filter expression functions.
 */
export type FilterExpressionFunctions = Record<string, (...args: any[]) => any>;

/**
 * Context for a 'BodyParser' function.
 */
export interface IBodyParserContext<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> {
    /**
     * The loaded body data.
     */
    body: Buffer;
    /**
     * The request context.
     */
    request: TRequest;
    /**
     * The request context.
     */
    response: TResponse;
}

/**
 * An execution context for a 'RequestErrorHandler' function.
 */
export interface IRequestErrorHandlerContext<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> extends IRequestFailedHandlerContext<TRequest, TResponse> {
    /**
     * The thrown error.
     */
    error: any;
}

/**
 * An execution context for a 'RequestFailedHandler' function.
 */
export interface IRequestFailedHandlerContext<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> {
    /**
     * The underlying request context.
     */
    request: TRequest;
    /**
     * The underlying response context.
     */
    response: TResponse;
    /**
     * The proposed HTTP status code.
     */
    statusCode: number;
    /**
     * The proposed HTTP status text.
     */
    statusText: string;
}

/**
 * An execution context for a 'RequestValidationErrorHandler' function.
 */
export interface IRequestValidationErrorHandlerContext<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> extends IRequestFailedHandlerContext<TRequest, TResponse> {
    /**
     * The thrown error.
     */
    error: JoiValidationError;
}

/**
 * A execution context of a 'SessionChecker' execution.
 */
export interface ISessionCheckerContext<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> {
    /**
     * Repository of available filter functions, which are especially used in
     * filter expressions.
     */
    filters: FilterExpressionFunctions;
    /**
     * The underlying request context.
     */
    request: TRequest;
    /**
     * The underlying response context.
     */
    response: TResponse;
}

/**
 * A context for a 'SessionPermissionCheckerPredicate' function.
 */
export interface ISessionPermissionCheckerPredicateContext<
    TSession extends any = any,
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> {
    /**
     * The underlying request context.
     */
    request: TRequest;
    /**
     * The underlying response context.
     */
    response: TResponse;
    /**
     * The current session.
     */
    session: TSession;
}

/**
 * A repository of filter expression functions, which can be overwritten.
 */
export type OverwritableFilterExpressionFunctions = Record<string, Optional<(...args: any[]) => any>>;

/**
 * Handles requests, which throw errors.
 *
 * @param {IRequestErrorHandlerContext<TRequest, TResponse>} context The underlying execution context.
 */
export type RequestErrorHandler<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> =
    (context: IRequestErrorHandlerContext<TRequest, TResponse>) => any;

/**
 * Handles failed requests.
 *
 * @param {IRequestFailedHandlerContext<TRequest, TResponse>} context The underlying execution context.
 */
export type RequestFailedHandler<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> =
    (context: IRequestFailedHandlerContext<TRequest, TResponse>) => any;

/**
 * Handles requests, where the validation of the input data failed.
 *
 * @param {IRequestErrorHandlerContext<TRequest, TResponse>} context The underlying execution context.
 */
export type RequestValidationErrorHandler<
    TRequest extends IncomingMessage = IncomingMessage,
    TResponse extends ServerResponse = ServerResponse> =
    (context: IRequestValidationErrorHandlerContext<TRequest, TResponse>) => any;

/**
 * A possible value for a 'revalidate' prop.
 */
export type RevalidateProp = number | boolean;

/**
 * A function, which checks for a valid (user) session.
 *
 * @param {ISessionCheckerContext<TSession>} context The current exeuction context.
 *
 * @returns {SessionCheckerResult<TSession>} The session, if available.
 *                                           If (false) is returned, the execution is stopped as 'Unauthorized'.
 */
export type SessionChecker<TSession extends any = any> =
    (context: ISessionCheckerContext) => SessionCheckerResult<TSession>;

/**
 * A result of a 'SessionChecker' execution.
 */
export type SessionCheckerResult<TSession extends any = any> =
    SessionCheckerResultValue<TSession> | PromiseLike<SessionCheckerResultValue>;

/**
 * A possible value for a result of a 'SessionChecker' execution.
 */
export type SessionCheckerResultValue<TSession extends any = any> =
    Nilable<TSession> | false;

/**
 * A possible value for 'toUserPermissionCheckPredicateSafe' function.
 */
export type SessionPermissionChecker<TSession extends any = any> =
    SessionPermissionCheckerPredicate<TSession> | "string";

/**
 * A function, which checks if a client has enough permission
 * inside the current session or not.
 *
 * @param {ISessionPermissionCheckerPredicateContext<TSession>} context The current execution context.
 *
 * @returns {any} A truthy indicates enough permissions.
 */
export type SessionPermissionCheckerPredicate<TSession extends any = any> = (
    context: ISessionPermissionCheckerPredicateContext<TSession>,
) => any;

export * from "@egomobile/types";
