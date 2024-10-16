/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ContactGroup = {
	title: string;
	id: string;
	members: Array<string>;
};

export type SharedContactGroup = {
	title: string;
	id: string;
	members: Array<string>;
	accountId: string;
};
