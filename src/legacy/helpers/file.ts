/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const buildArrayFromFileList = (filesList: FileList): Array<File> => {
	const files: Array<File> = [];
	if (!filesList) {
		return files;
	}
	for (let fileIndex = 0; fileIndex < filesList.length; fileIndex += 1) {
		files.push(filesList[fileIndex]);
	}

	return files;
};

export const convertToDecimal = (source: string): string => {
	let result = '';
	for (let i = 0; i < source.length; i += 1) {
		const charCode = source.charCodeAt(i);
		// Encode non-ascii or double quotes
		if (charCode > 127 || charCode === 34) {
			let temp = charCode.toString(10);
			while (temp.length < 4) {
				temp = `0${temp}`;
			}
			result += `&#${temp};`;
		} else {
			result += source.charAt(i);
		}
	}
	return result;
};
