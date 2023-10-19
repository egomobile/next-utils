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

import React from "react";
import type { Nilable, Nullable, Optional } from "../types/internal";

/**
 * Returns a user avatar by session.
 *
 * @param {TSessionProp} session The current session.
 *
 * @returns {Nullable<string>} The URL or `null` if not available.
 */
export type GetUserAvatarUrl<TSessionProp extends IUserSessionProp = IUserSessionProp> =
    (session: TSessionProp) => Nullable<string>;

/**
 * Options for `createUseUserSession()` function.
 */
export interface ICreateUseUserSessionOptions<TSessionProp extends IUserSessionProp = IUserSessionProp> {
    /**
     * Custom name of "super-admin" group.
     *
     * @default "admin"
     */
    adminGroup?: Nilable<string>;
    /**
     * Custom name of "super-admin" permission.
     *
     * @default "admin"
     */
    adminPermission?: Nilable<string>;
    /**
     * Custom name of "super-admin" role.
     *
     * @default "admin"
     */
    adminRole?: Nilable<string>;
    /**
     * Custom name of "totally blocked" group.
     *
     * @default "blocked"
     */
    blockedGroup?: Nilable<string>;
    /**
     * Custom name of "totally blocked" permission.
     *
     * @default "blocked"
     */
    blockedPermission?: Nilable<string>;
    /**
     * Custom name of "totally blocked" role.
     *
     * @default "blocked"
     */
    blockedRole?: Nilable<string>;
    /**
     * The context, which stores the session prop.
     */
    context: React.Context<Nullable<TSessionProp>>;
    /**
     * Returns a user avatar by session.
     */
    getUserAvatarUrl?: Nilable<GetUserAvatarUrl>;
}

/**
 * Result of `createUseUserSession()` function.
 */
export interface ICreateUseUserSessionResult<TSessionProp extends IUserSessionProp = IUserSessionProp> {
    /**
     * The new `useUser()` hook.
     */
    useUser: UseUser<TSessionProp>;
    /**
     * The new `useUserSession()` hook.
     */
    useUserSession: UseUserSession<TSessionProp>;
}

/**
 * Result of an `useUser()` hook.
 */
export interface IUseUserResult<TSessionProp extends IUserSessionProp = IUserSessionProp> {
    /**
     * The display name of the user, if available.
     */
    displayName: Nullable<string>;
    /**
     * The list of groups the user belongs to. If no user is logged, this array is empty.
     */
    groups: string[];
    /**
     * Checks for groups of current user. Alsways `false` if there is no user.
     */
    hasGroup: UseUserHasGroupPredicate;
    /**
     * Checks for permissions of current user. Alsways `false` if there is no user.
     */
    hasPermission: UseUserHasPermissionPredicate;
    /**
     * Checks for roles of current user. Alsways `false` if there is no user.
     */
    hasRole: UseUserHasRolePredicate;
    /**
     * The list of permissions the user belongs to. If no user is logged, this array is empty.
     */
    permissions: string[];
    /**
     * The URL of the avatar of the current user. `null` if there is no user.
     */
    photoUrl: Nullable<string>;
    /**
     * The list of roles the user belongs to. If no user is logged, this array is empty.
     */
    roles: string[];
    /**
     * The current user session, if available.
     */
    session: Nullable<TSessionProp>;
}

/**
 * A basic structure of a user session prop.
 */
export interface IUserSessionProp {
    /**
     * Information about the current user.
     */
    user: IUserSessionPropUser;
}

/**
 * User part of `IUserSessionProp`.
 */
export interface IUserSessionPropUser {
    /**
     * The display name.
     */
    displayName: string;
    /**
     * The list of groups.
     */
    groups: string[];
    /**
     * The ID of the user.
     */
    id: string;
    /**
     * The list of permissions.
     */
    permissions: string[];
    /**
     * The list of roles.
     */
    roles: string[];
}

/**
 * Structure of a `useUser` hook.
 *
 * @returns {IUseUserResult<TSessionProp>} The result.
*/
export type UseUser<TSessionProp extends IUserSessionProp = IUserSessionProp> =
    () => IUseUserResult<TSessionProp>;

/**
 * A function that checks if current user is part of all groups.
 *
 * @params {string[]} [groupsToCheck] Name of one or more groups to check.
 *
 * @returns {boolean} Is part of all `groupsToCheck` or not.
 */
export type UseUserHasGroupPredicate = (...groupsToCheck: string[]) => boolean;

/**
 * A function that checks if current user is part of all permissions.
 *
 * @params {string[]} [permissionsToCheck] Name of one or more groups to check.
 *
 * @returns {boolean} Is part of all `permissionsToCheck` or not.
 */
export type UseUserHasPermissionPredicate = (
    ...permissionsToCheck: string[]
) => boolean;

/**
 * A function that checks if current user is part of all roles.
 *
 * @params {string[]} [rolesToCheck] Name of one or more groups to check.
 *
 * @returns {boolean} Is part of all `rolesToCheck` or not.
 */
export type UseUserHasRolePredicate = (...rolesToCheck: string[]) => boolean;

/**
 * Structure of a `useUserSession` hook.
 *
 * @param {boolean} [required=true] If `true`, an exception is throw if no session is available, otherwise `null` will be returned.
 *
 * @returns {Nullable<TSessionProp>} The session or `null` if there is no session.
 */
export type UseUserSession<TSessionProp extends IUserSessionProp = IUserSessionProp> =
    (required?: Optional<boolean>) => Nullable<TSessionProp>;

/**
 * Creates new `useUserSession()` and `useUser()` hooks.
 *
 * @param {ICreateUseUserSessionOptions<TSessionProp>} options The options.
 *
 * @returns {ICreateUseUserSessionResult<TSessionProp>} The result with the new hooks.
 */
export function createUseUserSession<TSessionProp extends IUserSessionProp = IUserSessionProp>(
    options: ICreateUseUserSessionOptions<TSessionProp>
): ICreateUseUserSessionResult<TSessionProp> {
    const {
        context
    } = options;

    const adminGroup = options.adminGroup ?? "admin";
    const adminPermission = options.adminPermission ?? "admin";
    const adminRole = options.adminRole ?? "admin";
    const blockedGroup = options.blockedGroup ?? "blocked";
    const blockedPermission = options.blockedPermission ?? "blocked";
    const blockedRole = options.blockedRole ?? "blocked";

    const getUserAvatarUrl: GetUserAvatarUrl<TSessionProp> = options.getUserAvatarUrl ?? ((session) => {
        return `/api/users/${encodeURIComponent(session.user.id)}/photo`;
    });

    const useUserSession: UseUserSession<TSessionProp> = (required?: boolean): Nullable<TSessionProp> => {
        const session = React.useContext(context);

        if (!session && required) {
            throw new Error("user session is required");
        }

        return session;
    };

    const useUser: UseUser<TSessionProp> = (): IUseUserResult<TSessionProp> => {
        const session = useUserSession(false) || null;

        const displayName = session?.user.displayName || null;
        const permissions = session?.user.permissions || [];
        const roles = session?.user.roles || [];
        const groups = session?.user.groups || [];

        let hasGroup: UseUserHasGroupPredicate = () => {
            return false;
        };

        let hasPermission: UseUserHasPermissionPredicate = () => {
            return false;
        };

        let hasRole: UseUserHasRolePredicate = () => {
            return false;
        };

        if (session) {
            // setup hasGroup function.
            if (groups.includes(blockedGroup)) {
                hasGroup = () => {
                    // user has blocked group.
                    return false;
                };
            }
            else if (groups.includes(adminGroup)) {
                hasGroup = () => {
                    // user has admin group.
                    return true;
                };
            }
            else if (groups.length) {
                hasGroup = (...groupsToCheck) => {
                    return groupsToCheck.every((gtc) => {
                        return groups.some((g) => {
                            return gtc.match(g);
                        });
                    });
                };
            }

            // setup hasPermission function.
            if (permissions.includes(blockedPermission)) {
                hasPermission = () => {
                    // user has blocked permission.
                    return false;
                };
            }
            else if (permissions.includes(adminPermission)) {
                hasPermission = () => {
                    // user has admin permission.
                    return true;
                };
            }
            else if (permissions.length) {
                hasPermission = (...permissionsToCheck) => {
                    return permissionsToCheck.every((ptc) => {
                        return permissions.some((p) => {
                            return ptc.match(p);
                        });
                    });
                };
            }

            // setup hasRole function.
            if (roles.includes(blockedRole)) {
                hasRole = () => {
                    // user has blocked role.
                    return false;
                };
            }
            else if (roles.includes(adminRole)) {
                hasRole = () => {
                    // user has admin role.
                    return true;
                };
            }
            else if (roles.length) {
                hasRole = (...rolesToCheck) => {
                    return rolesToCheck.every((rtc) => {
                        return roles.some((r) => {
                            return rtc.match(r);
                        });
                    });
                };
            }
        }

        return {
            displayName,
            groups,
            hasGroup,
            hasPermission,
            hasRole,
            permissions,
            "photoUrl": session ?
                (getUserAvatarUrl(session) || null) :
                null,
            roles,
            session
        };
    };

    return {
        useUser,
        useUserSession
    };
}
