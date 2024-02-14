/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';

export type UploadAttachmentOptions = {
	onUploadProgress?: (file: File, uploadId: string, percentage: number) => void;
	onUploadComplete?: ({
		attachmentId,
		folderId,
		createSnackbar,
		t
	}: {
		attachmentId: string;
		folderId: string;
		createSnackbar: CreateSnackbarFn;
		t: TFunction;
	}) => void;
	onUploadError?: (file: File, uploadId: string, error: string) => void;
};

export type UploadAttachmentResult = {
	file: File;
	uploadId: string;
	abortController: AbortController;
};

export type ImportAddressBookResponse = {
	cn: [{ n: number; ids: string }];
};

export type ImportAddressBookRequest = {
	folderId: string;
	aid: string;
};
