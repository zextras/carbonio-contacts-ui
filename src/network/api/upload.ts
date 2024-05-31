/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { encodeNonAsciiAndQuotesToDecimal } from '../../legacy/helpers/file';

export type UploadResponseFileInfo = [
	number,
	'null',
	Array<{
		aid: string;
		ct: string;
		filename: string;
		s: number;
	}>
];

export type UploadedFileInfo = {
	aid: string;
	contentType: string;
	fileName: string;
	size: number;
};

const normalizeResponse = (rawResponse: string): Array<UploadedFileInfo> => {
	// eslint-disable-next-line no-new-func
	const response: UploadResponseFileInfo = Function(`'use strict'; return ([${rawResponse}])`)();
	if (response.length !== 3) {
		return [];
	}

	const filesInfo = response[2];
	return filesInfo.map((fileInfo) => ({
		aid: fileInfo.aid,
		contentType: fileInfo.ct,
		fileName: fileInfo.filename,
		size: fileInfo.s
	}));
};

export const upload = (file: File): Promise<Array<UploadedFileInfo>> =>
	fetch('/service/upload?fmt=extended,raw', {
		method: 'POST',
		headers: {
			'Cache-Control': 'no-cache',
			'X-Requested-With': 'XMLHttpRequest',
			'Content-Type': `${file.type || 'application/octet-stream'};`,
			'Content-Disposition': `attachment; filename="${encodeNonAsciiAndQuotesToDecimal(file.name)}"`
		},
		body: file
	})
		.then((response) => response.text())
		.then((response) => {
			const result = normalizeResponse(response);
			if (result.length === 0) {
				throw new Error('No file uploaded');
			}

			return result;
		});
