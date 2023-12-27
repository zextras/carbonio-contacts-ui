/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type DistributionList = {
	email: string;
	displayName?: string;
	isOwner: boolean;
	owners?: Array<{ id: string; name: string }>;
};

export type DLMember = string;

export type DistributionListMembersPage = {
	total: number;
	more: boolean;
	members: Array<DLMember>;
};
