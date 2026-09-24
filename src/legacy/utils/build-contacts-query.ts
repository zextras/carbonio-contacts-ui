/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const FILTER_TYPES = {
	ALL: 'ALL',
	CONTACT: 'CONTACT',
	CONTACT_GROUP: 'CONTACT_GROUP'
} as const;

export type ContactFilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

export const buildContactsQuery = ({
	folderId,
	filterType
}: {
	folderId: string;
	filterType: ContactFilterType;
}): string => {
	let query = `inid:"${folderId}"`;

	if (filterType === FILTER_TYPES.CONTACT) {
		query += ` and not #type:group`;
	} else if (filterType === FILTER_TYPES.CONTACT_GROUP) {
		query += ` and #type:group`;
	}

	return query;
};
