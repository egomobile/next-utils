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

import type { Optional } from "@egomobile/types";
import type { IncomingMessage, ServerResponse } from "http";
import type { UrlWithParsedQuery } from "url";

export type NextRequestHandler = (req: IncomingMessage, res: ServerResponse, parsedUrl?: Optional<UrlWithParsedQuery>) => Promise<any>;

export * from "@egomobile/types";
