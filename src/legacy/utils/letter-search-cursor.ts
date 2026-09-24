/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ALPHABET, OTHER_INITIAL } from 'legacy/utils/contact-initial';

export type LetterCursor = {
	sortVal: string;
	endSortVal?: string;
};

const nextChar = (char: string): string => String.fromCharCode(char.charCodeAt(0) + 1);

/*
 * Maps a letter grid selection to the sortVal/endSortVal bounds of a
 * nameAsc-sorted Search request: the range [sortVal, endSortVal) the server
 * uses to position the cursor. Digits and symbols sort before "a", so the "#"
 * bucket (OTHER_INITIAL) is expressed as everything below it. The last letter
 * has no endSortVal: the server's collation doesn't treat the next ASCII
 * character as sorting right after "z", so the range is left open-ended
 * instead of guessing a sentinel that would silently exclude every match.
 */
export const getLetterCursor = (letter: string | null): LetterCursor | undefined => {
	if (letter === null) {
		return undefined;
	}
	if (ALPHABET.includes(letter)) {
		const sortVal = letter.toLowerCase();
		const isLastLetter = letter === ALPHABET[ALPHABET.length - 1];
		return isLastLetter ? { sortVal } : { sortVal, endSortVal: nextChar(sortVal) };
	}
	if (letter === OTHER_INITIAL) {
		return { sortVal: '', endSortVal: 'a' };
	}
	return undefined;
};
