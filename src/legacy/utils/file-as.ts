/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { trim } from 'lodash';

export const FILE_AS_FREE_TEXT = 8;
export const DEFAULT_FILE_AS = 1;

type FileAsParts = {
	firstName?: string;
	lastName?: string;
	company?: string;
	fileAsFreeText?: string;
};

const combineWithParens = (primary: string, secondary: string): string => {
	if (primary && secondary) return `${primary} (${secondary})`;
	return primary || secondary;
};

export function composeFileAsDescription(fileAs: number | undefined, parts: FileAsParts): string {
	const firstName = parts.firstName ?? '';
	const lastName = parts.lastName ?? '';
	const company = parts.company ?? '';
	const lastFirst = trim(`${lastName}, ${firstName}`, ', ');
	const firstLast = trim(`${firstName} ${lastName}`);

	switch (fileAs) {
		case 2:
			return firstLast;
		case 3:
			return company;
		case 4:
			return combineWithParens(lastFirst, company);
		case 5:
			return combineWithParens(firstLast, company);
		case 6:
			return combineWithParens(company, lastFirst);
		case 7:
			return combineWithParens(company, firstLast);
		case FILE_AS_FREE_TEXT:
			return parts.fileAsFreeText ?? '';
		case 1:
		default:
			return lastFirst;
	}
}

export function composeFileAsAttr(fileAs: number | undefined, fileAsFreeText?: string): string {
	if (fileAs === FILE_AS_FREE_TEXT) {
		return `${FILE_AS_FREE_TEXT}:${fileAsFreeText ?? ''}`;
	}
	return `${fileAs ?? DEFAULT_FILE_AS}`;
}

export function parseFileAsAttr(raw?: string): { fileAs: number; fileAsFreeText?: string } {
	const match = raw?.match(/^(\d+)(?::(.*))?$/);
	if (!match) {
		return { fileAs: DEFAULT_FILE_AS };
	}
	const code = parseInt(match[1], 10);
	if (code === FILE_AS_FREE_TEXT) {
		return { fileAs: FILE_AS_FREE_TEXT, fileAsFreeText: match[2] ?? '' };
	}
	return { fileAs: code || DEFAULT_FILE_AS };
}
