/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ALPHABET, DIGITS, OTHER_INITIAL } from 'legacy/utils/contact-initial';

export const FILTER_TYPES = {
	ALL: 'ALL',
	CONTACT: 'CONTACT',
	CONTACT_GROUP: 'CONTACT_GROUP'
} as const;

export type ContactFilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

/*
 * The prefixes a given filter value matches on: a single letter for A-Z, every
 * digit for the "#" bucket. Returns undefined for anything else, so that a value
 * which cannot be expressed as a query never reaches the query string.
 */
const prefixesOf = (letter: string): Array<string> | undefined => {
	if (ALPHABET.includes(letter)) {
		return [letter];
	}
	if (letter === OTHER_INITIAL) {
		return DIGITS;
	}
	return undefined;
};

const startsWith = (field: string, prefixes: Array<string>): string => {
	if (prefixes.length === 1) {
		return `#${field}:${prefixes[0]}*`;
	}
	const alternatives = prefixes.map((prefix) => `#${field}:${prefix}*`).join(' or ');
	return `(${alternatives})`;
};

/*
 * Replicates, as a Search query, the cascade used to build the value displayed in
 * the contact list (see getContactSortValue / use-display-name.ts):
 * displayName, then firstName, then lastName, then the primary email.
 * Each step is taken only when the previous fields are empty, so that a contact is
 * matched on the very same value the user reads in the list.
 */
const contactInitialClause = (prefixes: Array<string>): string =>
	`(${startsWith('displayName', prefixes)} or (#displayName:"" and ` +
	`(${startsWith('firstName', prefixes)} or (#firstName:"" and ` +
	`(${startsWith('lastName', prefixes)} or (#lastName:"" and ${startsWith('email', prefixes)}))))))`;

/*
 * Contact groups have no name parts: their title is normalized from the fullName
 * attribute (see normalize-contact-from-soap.ts).
 */
const groupInitialClause = (prefixes: Array<string>): string => startsWith('fullName', prefixes);

const initialClause = (prefixes: Array<string>, filterType: ContactFilterType): string => {
	if (filterType === FILTER_TYPES.CONTACT) {
		return contactInitialClause(prefixes);
	}
	if (filterType === FILTER_TYPES.CONTACT_GROUP) {
		return groupInitialClause(prefixes);
	}
	return (
		`((not #type:group and ${contactInitialClause(prefixes)})` +
		` or (#type:group and ${groupInitialClause(prefixes)}))`
	);
};

export const buildContactsQuery = ({
	folderId,
	filterType,
	letter
}: {
	folderId: string;
	filterType: ContactFilterType;
	letter?: string | null;
}): string => {
	let query = `inid:"${folderId}"`;

	if (filterType === FILTER_TYPES.CONTACT) {
		query += ` and not #type:group`;
	} else if (filterType === FILTER_TYPES.CONTACT_GROUP) {
		query += ` and #type:group`;
	}

	const prefixes = letter ? prefixesOf(letter) : undefined;
	if (prefixes) {
		query += ` and ${initialClause(prefixes, filterType)}`;
	}

	return query;
};
