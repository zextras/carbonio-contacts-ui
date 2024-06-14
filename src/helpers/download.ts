/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Redirect the browser to the given file
 *
 * This function is not testable
 *
 * @param content
 * @param fileName
 * @param mimeType
 */
export const redirectToBlob = (content: string, fileName: string, mimeType: string): void => {
	const blob = new Blob([content], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
};
