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

import { compileExpression } from "filtrex";
import { asAsync, isNil } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";
import type { BodyParser, OverwritableFilterExpressionFunctions, RequestValidationErrorHandler, SessionChecker, SessionPermissionChecker, SessionPermissionCheckerPredicate } from "../types";
import { createFilterExpressionFunctions } from ".";
import { apiResponse } from "../api";

export interface IToSessionPermissionCheckPredicateSafeOptions {
    checker: Nilable<SessionPermissionChecker>;
    customFilterExpressionFunctions: Nilable<OverwritableFilterExpressionFunctions>;
}

export function toBodyParserSafe(parser: Nilable<BodyParser>): Nilable<BodyParser> {
    if (!isNil(parser)) {
        if (typeof parser !== "function") {
            throw new TypeError("parser must be of type function");
        }

        return asAsync(parser);
    }

    return parser;
}

export function toRequestValidationErrorHandlerSafe(handler: Nilable<RequestValidationErrorHandler>): RequestValidationErrorHandler {
    if (isNil(handler)) {
        handler = async ({ error, request, response, statusCode, statusText }) => {
            apiResponse(request, response)
                .noSuccess()
                .addMessage({
                    "code": statusCode * 100,
                    "type": "error",
                    "internal": true,
                    "message": `[${statusText}] ${error.message}`
                })
                .withStatus(statusCode)
                .send();
        };
    }
    else {
        if (typeof handler !== "function") {
            throw new TypeError("handler must be of type function");
        }
    }

    return asAsync(handler);
}

export function toSessionPermissionCheckPredicateSafe({
    checker,
    customFilterExpressionFunctions
}: IToSessionPermissionCheckPredicateSafeOptions): SessionPermissionCheckerPredicate {
    if (isNil(checker)) {
        checker = async () => {
            return true;
        };
    };

    if (typeof checker === "function") {
        return asAsync(checker);
    }

    const filterPredicate = compileExpression(checker, {
        ...createFilterExpressionFunctions({
            "overwrites": customFilterExpressionFunctions
        })
    });

    return async ({ request }) => {
        try {
            const query: Record<string, string> = {};

            const qMark = request.url?.indexOf("?") ?? -1;
            if (qMark > -1) {
                // s. https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript

                const pl = /\+/g;  // Regex for replacing addition symbol with a space
                const search = /([^&=]+)=?([^&]*)/g;
                const decode = (s: string) => {
                    return decodeURIComponent((s ?? "").replace(pl, " "));
                };
                const searchParams = request.url!.substring(qMark + 1);

                let match: Nilable<RegExpExecArray>;
                while (match = search.exec(searchParams)) {
                    query[decode(match[1])] = decode(match[2]);
                }
            }

            return filterPredicate({
                "headers": request.headers,
                "method": request.method ?? "GET",
                "params": request.params ?? {},
                query,
                "url": request.url ?? ""
            });
        }
        catch {
            return false;
        }
    };
}


export function toSessionCheckerSafe<TSession extends any = any>(
    checker: Nilable<SessionChecker<TSession>>
): SessionChecker<TSession> {
    if (isNil(checker)) {
        checker = async () => {
            return undefined;  // we do not work with sessions here
        };
    }
    else {
        if (typeof checker !== "function") {
            throw new TypeError("options.checkSession must be of type function");
        }
    }

    return asAsync(checker);
}
