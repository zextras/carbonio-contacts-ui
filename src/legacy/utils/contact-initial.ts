/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { trim } from 'lodash';

import { ContactOrGroup } from 'legacy/types/contact';
import { isGroup } from 'legacy/utils/helpers';

/**
 * Bucket for every item whose initial is not a letter of the latin alphabet.
 * As a list section it collects digits, symbols and non latin scripts alike;
 * as a filter it selects the items whose initial is a digit, since that is the
 * only part of the bucket which can be expressed as a Search query.
 */
export const OTHER_INITIAL = '123';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DIGITS = '0123456789'.split('');

const DIACRITICS_REG = /\p{Diacritic}/gu;

/*
 * Returns the value the contact list displays for the given item, without any
 * decoration. It mirrors the cascade of getDisplayName (see use-display-name.ts)
 * but it omits the "<No Name>" prefix of the email fallback, which would
 * otherwise make every email-only contact sort and group under "<".
 */
export const getContactSortValue = (item: ContactOrGroup): string => {
	if (isGroup(item)) {
		return item.title ?? '';
	}
	if (item.displayName) {
		return item.displayName;
	}
	if (item.firstName || item.lastName) {
		return trim(`${item.firstName || ''} ${item.lastName || ''}`);
	}
	const firstEmailType = Object.keys(item.email ?? {})[0];
	return (firstEmailType && item.email[firstEmailType]?.mail) || '';
};

/**
 * Returns the letter section the given item belongs to: the first character of
 * its displayed value, stripped of diacritics and upper cased, or OTHER_INITIAL
 * when that character is not part of the latin alphabet.
 */
export const getContactInitial = (item: ContactOrGroup): string => {
	const initial = getContactSortValue(item)
		.trim()
		.charAt(0)
		.normalize('NFD')
		.replaceAll(DIACRITICS_REG, '')
		.toUpperCase();

	return ALPHABET.includes(initial) ? initial : OTHER_INITIAL;
};
