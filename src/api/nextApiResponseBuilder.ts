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

import { ApiResponseBuilder } from "@egomobile/api-utils";
import type { IHttpRequest, IHttpResponse } from "@egomobile/http-server";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * A special version of 'ApiResponseBuilder' for Next.js.
 */
export class NextApiResponseBuilder extends ApiResponseBuilder {
    /**
     * Initializes a new instance of that class.
     *
     * @param {IncomingMessage} request The request context.
     * @param {ServerResponse} response The response context.
     */
    public constructor(request: IncomingMessage, response: ServerResponse) {
        super({
            "request": request as IHttpRequest,
            "response": response as IHttpResponse,
            "executeEnd": true
        });
    }
}
