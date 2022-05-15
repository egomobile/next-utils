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

import { asAsync, isNil } from "@egomobile/nodelike-utils";
import type { Nilable } from "@egomobile/types";
import type { SessionChecker, SessionPermissionChecker, SessionPermissionCheckerPredicate } from "../types";

export function toSessionPermissionCheckPredicateSafe(
    checker: Nilable<SessionPermissionChecker>,
): SessionPermissionCheckerPredicate {
    if (isNil(checker)) {
        checker = async () => {
            return true;
        };
    };

    return checker;
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
