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
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * A special version of 'ApiResponseBuilder' for Next.js.
 */
export class NextApiResponseBuilder extends ApiResponseBuilder {
    /**
     * Initializes a new instance of that class.
     *
     * @param {NextApiRequest} request The request context.
     * @param {NextApiResponse<any>} response The response context.
     */
    public constructor(request: NextApiRequest, response: NextApiResponse<any>) {
        super({
            "request": request as any,
            "response": response as any,
            "executeEnd": true
        });
    }
}
