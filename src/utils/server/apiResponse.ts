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

// system imports
import type { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseBuilder } from "../../types";

/**
 * Creates a new API response builder.
 *
 * @param {NextApiRequest} request The request context.
 * @param {NextApiResponse<any>} response The response context.
 *
 * @returns {NextApiResponseBuilder} The new builder instance.
 */
export function apiResponse(
    request: NextApiRequest,
    response: NextApiResponse<any>,
): NextApiResponseBuilder {
    return new NextApiResponseBuilder(request, response as any);
}
