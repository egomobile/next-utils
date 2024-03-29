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

import { schema as _schema } from "@egomobile/http-server";
import type { Root as JoiRoot } from "joi";

/**
 * Alias for 'joi' module.
 */
export const schema = _schema as unknown as JoiRoot;

export * from "./types";
export * from "./middlewares";
export * from "./hooks";

export {
    throwOnUnexpectedApiResponse,
    UnexpectedApiResponseError
} from "@egomobile/api-utils";
