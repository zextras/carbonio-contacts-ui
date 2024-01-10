/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type DistributionListOwner = { id: string; name: string };

export type DistributionList = {
	id: string;
	email: string;
	displayName?: string;
	isOwner: boolean;
	isMember?: boolean;
	owners?: Array<DistributionListOwner>;
	description?: string;
};

export type DistributionListMembersPage = {
	total: number;
	more: boolean;
	members: Array<string>;
};
