/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { UIAction } from './types';
import { ACTION_IDS, TIMEOUTS } from '../constants';
import { getDisplayName } from '../legacy/hooks/use-display-name';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

const FILENAME_EXTENSION = 'vcf';
const MIME_TYPE = 'text/vcard';

export type ExportContactAction = UIAction<Contact, Contact>;

const redirectToBlob = (content: string, fileName: string): void => {
	const blob = new Blob([content], { type: MIME_TYPE });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	a.click();
	window.URL.revokeObjectURL(url);
};

export const useActionExportContact = (): ExportContactAction => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const canExecute = useCallback<ExportContactAction['canExecute']>(
		(contact?: Contact): boolean => {
			if (!contact) {
				return false;
			}

			return true;
		},
		[]
	);

	const execute = useCallback<ExportContactAction['execute']>(
		(contact) => {
			if (!canExecute(contact)) {
				return;
			}

			if (!contact) {
				return;
			}

			const fileName = `${getDisplayName(contact) ?? contact.id}.${FILENAME_EXTENSION}`;

			apiClient
				.getItem(contact.id)
				.then((content) => {
					redirectToBlob(content, fileName);
				})
				.catch(() => {
					createSnackbar({
						key: 'export-contact-error',
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				});
		},
		[canExecute, createSnackbar, t]
	);

	return useMemo(
		() => ({
			id: ACTION_IDS.exportContact,
			label: t('label.export_contact', 'Export vCard file'),
			icon: 'DownloadOutline',
			execute,
			canExecute
		}),
		[canExecute, execute, t]
	);
};
