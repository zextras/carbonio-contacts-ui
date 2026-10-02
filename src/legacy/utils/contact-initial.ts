/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactOrGroup } from 'legacy/types/contact';
import { isGroup } from 'legacy/utils/helpers';

/**
 * Bucket for every item whose initial is not a letter of the latin alphabet:
 * digits, symbols and non latin scripts alike. Shown as "#" in the letter grid
 * and the list sections.
 */
export const OTHER_INITIAL = '#';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const DIACRITICS_REG = /\p{Diacritic}/gu;

/*
 * Returns the value the contact list displays and sorts on for the given item:
 * the server-computed fileAsStr for contacts, or the title for a contact group
 * (groups have no fileAsStr, see normalize-contact-from-soap.ts).
 */
const initialSourceValue = (item: ContactOrGroup): string =>
	isGroup(item) ? (item.title ?? '') : (item.fileAsStr ?? '');

/**
 * Returns the letter section the given item belongs to: the first character of
 * its displayed value, stripped of diacritics and upper cased, or OTHER_INITIAL
 * when that character is not part of the latin alphabet.
 */
export const getContactInitial = (item: ContactOrGroup): string => {
	const initial = initialSourceValue(item)
		.trim()
		.charAt(0)
		.normalize('NFD')
		.replaceAll(DIACRITICS_REG, '')
		.toUpperCase();

	return ALPHABET.includes(initial) ? initial : OTHER_INITIAL;
};
