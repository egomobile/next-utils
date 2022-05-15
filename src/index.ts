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

import joi from "joi";
import next from "next";
import url from "url";
import { createServer, IHttpServer } from "@egomobile/http-server";
import { isNil } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";
import type { NextServer } from "next/dist/server/next";
import type { NextRequestHandler } from "./types/internal";

/**
 * Options for 'setupHTTPServer()' function.
 */
export interface ISetupHTTPServerOptions {
    /**
     * Inidictaes, if anything should be setup for
     * development environment or not.
     */
    development?: Nilable<boolean>;
    /**
     * The custom server instance to use.
     */
    server?: Nilable<IHttpServer>;
}

/**
 * A result of a 'setupHTTPServer()' call.
 */
export interface ISetupHTTPServerResult {
    /**
     * The created app instance.
     */
    app: NextServer;
    /**
     * The created handler.
     */
    handler: NextRequestHandler;
    /**
     * The underlying server instance.
     */
    server: IHttpServer;
}

/**
 * Sets up a HTTP server instance for use with Next.js
 *
 * @example
 * ```
 * // npm i cors && npm i -D @types/cors
 * import cors from "cors"
 * // npm i cookie-parser && npm i -D @types/cookie-parser
 * import cookieParser from "cookie-parser"
 * import { createServer } from "@egomobile/http-server"
 * import { setupHTTPServer } from "@egomobile/next-utils"
 *
 * // underlying HTTP server
 * // with handle the requests
 * const server = createServer()
 *
 * // add global middlewares
 * server.use(cors())
 * server.use(cookieParser())
 *
 * await setupHTTPServer({
 *   server
 * })
 *
 * // 'app' is the Next.js app instance
 * const { app } = await server.listen()
 * ```
 *
 * @param {ISetupHTTPServerOptions} [options] Custom options.
 *
 * @returns {Promise<ISetupHTTPServerResult>} The promise with the result,
 */
export async function setupHTTPServer(
    options: ISetupHTTPServerOptions = {}
): Promise<ISetupHTTPServerResult> {
    if (typeof options !== "object") {
        throw new TypeError("options must be of type object");
    }

    let server = options.server;
    if (isNil(server)) {
        server = createServer();
    }

    if (server.isEgoHttpServer !== true) {
        throw new TypeError("options.server must be of type IHttpServer");
    }

    const isDev = !!options.development;

    const app = next({ "dev": isDev });
    await app.prepare();

    const handler = app.getRequestHandler();

    // any method ...
    server.all(
        () => {
            return true;
        }, // ... and any path
        async (request, response) => {
            await handler(request, response, url.parse(request.url ?? "/", true));
        },
    );

    return {
        app,
        handler,
        server
    };
}

export {
    CheckIfShouldTickPredicate,
    IJobConfig,
    IJobExecutionContext,
    JobAction,
    DebugAction as JobDebugAction,
    DebugIcon as JobDebugIcon
} from "@egomobile/jobs";
export {
    AlternativesSchema,
    AnySchema,
    ArraySchema,
    BinarySchema,
    BooleanSchema,
    DateSchema, ExtensionBoundSchema, FunctionSchema,
    isSchema, LinkSchema,
    NumberSchema,
    ObjectPropertiesSchema,
    ObjectSchema, PartialSchemaMap, Schema, SchemaFunction, SchemaInternals, SchemaLike,
    SchemaLikeWithoutArray,
    SchemaMap, StrictSchemaMap, StringSchema, SymbolSchema, ValidationError as JoiValidationError
} from "joi";

export * from "./api";
export * from "./pages";
export * from "./utils";

/**
 * Alias for 'joi' module.
 */
export const schema = joi;
