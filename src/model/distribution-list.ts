/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type DistributionList = {
	id: string;
	email: string;
	displayName?: string;
	isOwner: boolean;
	isMember?: boolean;
	owners?: Array<{ id: string; name: string }>;
	description?: string;
};

export type DistributionListMembersPage = {
	total: number;
	more: boolean;
	members: Array<string>;
};
