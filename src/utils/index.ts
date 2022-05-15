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

import { isNil } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";
import type { FilterExpressionFunctions, OverwritableFilterExpressionFunctions } from "../types";

/**
 * Options for 'createDefaultFilterFunctions()' function.
 */
export interface ICreateDefaultFilterFunctionsOptions {
    /**
     * One or more functions to overwrite, add or remove.
     */
    overwrites?: Nilable<OverwritableFilterExpressionFunctions>;
}

/**
 * Creates a repository of functions, which can be used in filter expression.
 * @param {Nilable<ICreateDefaultFilterFunctionsOptions>} [options] Custom options.
 *
 * @returns {FilterExpressionFunctions} The new list of functions.
 */
export function createFilterExpressionFunctions(options?: Nilable<ICreateDefaultFilterFunctionsOptions>): FilterExpressionFunctions {
    const overwrites = options?.overwrites;
    if (!isNil(overwrites)) {
        if (typeof overwrites !== "object") {
            throw new TypeError("options.overwrites must be of type object");
        }

        const hasInvalidValue = Object.values(overwrites).some((v) => {
            return typeof v !== "undefined" && typeof v !== "function";
        });
        if (hasInvalidValue) {
            throw new TypeError("All values of options.overwrites must be of type function or undefined");
        }
    }

    return {
        ...(overwrites ?? {})
    } as FilterExpressionFunctions;
}
