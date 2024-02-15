/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { CreateModalFn, CreateSnackbarFn } from '@zextras/carbonio-design-system';
import axios from 'axios';
import { TFunction } from 'i18next';
import { v4 as uuid } from 'uuid';

import { buildArrayFromFileList, encodeNonAsciiAndQuotesToDecimal } from '../../../../helpers/file';
import { importAddressBook } from '../../../../store/actions/import-address-book';
import { StoreProvider } from '../../../../store/redux';
import {
	ImportAddressBookResponse,
	UploadAttachmentOptions,
	UploadAttachmentResult
} from '../../../../types/import-address-book';
import { ImportContactsModal } from '../../import-contacts-modal';

function parse(str: string): Array<Array<{ aid: string }>> {
	// eslint-disable-next-line no-new-func
	return Function(`'use strict'; return (${str})`)();
}

function onUploadComplete({
	attachmentId,
	folderId,
	createSnackbar,
	t
}: {
	attachmentId: string;
	folderId: string;
	createSnackbar: CreateSnackbarFn;
	t: TFunction;
}): void {
	importAddressBook({ aid: attachmentId, folderId }).then((res: ImportAddressBookResponse) => {
		const count = res.cn[0].n;
		if (!('Fault' in res)) {
			createSnackbar({
				key: 'import_contacts_success',
				replace: true,
				type: 'info',
				hideButton: true,
				label: t('import_contacts.snackbar.import_contacts_success', {
					count,
					defaultValue: `{{count}} contacts imported and added to the selected address book`,
					defaultValue_one: `{{count}} contact imported and added to the selected address book`
				}),
				autoHideTimeout: 3000
			});
		} else {
			createSnackbar({
				key: 'error_snackbar',
				replace: true,
				type: 'error',
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000,
				hideButton: true
			});
		}
	});
}

function onUploadError({
	file,
	createSnackbar,
	t
}: {
	file: File;
	createSnackbar: CreateSnackbarFn;
	t: TFunction;
}): void {
	createSnackbar({
		key: `upload-error`,
		replace: true,
		type: 'error',
		label: t('label.errors.upload_failed_generic', {
			filename: file.name,
			defaultValue: 'Upload failed for the file "{{filename}}"'
		}),
		autoHideTimeout: 3000
	});
}

export const confirmCallback = ({
	file,
	folderId,
	createSnackbar,
	t,
	options
}: {
	file: File;
	folderId: string;
	createSnackbar: CreateSnackbarFn;
	t: TFunction;
	options?: UploadAttachmentOptions;
}): UploadAttachmentResult => {
	const uploadId: string = uuid();
	const abortController = new AbortController();

	axios
		.post('/service/upload?fmt=extended,raw', file, {
			headers: {
				'Cache-Control': 'no-cache',
				'X-Requested-With': 'XMLHttpRequest',
				'Content-Type': `${file.type || 'application/octet-stream'};`,
				'Content-Disposition': `attachment; filename="${encodeNonAsciiAndQuotesToDecimal(
					file.name
				)}"`
			},
			onUploadProgress: (progressEvent) => {
				const { loaded, total } = progressEvent;
				const percent = total ? Math.round((loaded * 100) / total) : 0;
				if (percent < 100) {
					options?.onUploadProgress && options?.onUploadProgress(file, uploadId, percent);
				}
			},
			signal: abortController.signal
		})
		.then((res) => res.data)
		.then((txt) => parse(`[${txt}]`))
		.then((val) => {
			if (!val[2]) {
				options?.onUploadError && options?.onUploadError({ file, createSnackbar, t });
				return;
			}

			options?.onUploadComplete &&
				options?.onUploadComplete({ attachmentId: val[2][0].aid, folderId, createSnackbar, t });
		})
		.catch(() => {
			options?.onUploadError && options?.onUploadError({ file, createSnackbar, t });
		});

	return {
		file,
		uploadId,
		abortController
	};
};

function inputElementOnchange({
	ev,
	folderId,
	folderName,
	createModal,
	createSnackbar,
	t
}: {
	ev: Event;
	folderId: string;
	folderName: string;
	createModal: CreateModalFn;
	createSnackbar: CreateSnackbarFn;
	t: TFunction;
}): void {
	if (ev.currentTarget instanceof HTMLInputElement) {
		const { files } = ev.currentTarget;
		if (!files) return;
		const file = buildArrayFromFileList(files)[0];
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<ImportContactsModal
							closeCallback={(): void => {
								closeModal();
							}}
							confirmCallback={(): UploadAttachmentResult =>
								confirmCallback({
									file,
									folderId,
									createSnackbar,
									t,
									options: { onUploadComplete, onUploadError }
								})
							}
							folderName={folderName}
							fileName={file.name}
						/>
					</StoreProvider>
				)
			},
			true
		);
		// required to select 2 times the same file/files
		ev.currentTarget.value = '';
	}
}

export const inputElement = ((): HTMLInputElement => {
	const input = document.createElement('input');
	if (input) {
		input.type = 'file';
		input.multiple = false;
		input.hidden = false;
		input.accept = '.csv, text/csv';
	}
	return input;
})();

export function importContacts({
	folderId,
	folderName,
	createModal,
	createSnackbar,
	t
}: {
	folderId: string;
	folderName: string;
	createModal: CreateModalFn;
	createSnackbar: CreateSnackbarFn;
	t: TFunction;
}): void {
	inputElement.click();
	inputElement.onchange = (ev): void =>
		inputElementOnchange({ ev, folderId, folderName, createModal, createSnackbar, t });
}
