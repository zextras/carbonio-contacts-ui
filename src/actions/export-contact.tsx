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
import { redirectToBlob } from '../helpers/download';
import { getDisplayName } from '../legacy/hooks/use-display-name';
import { Contact } from '../legacy/types/contact';
import { apiClient } from '../network/api-client';

const FILENAME_EXTENSION = 'vcf';
const MIME_TYPE = 'text/vcard';

export type ExportContactAction = UIAction<Contact, Contact>;

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
					redirectToBlob(content, fileName, MIME_TYPE);
					createSnackbar({
						key: 'export-contact-success',
						replace: true,
						type: 'info',
						label: t('export_contact.snackbar.success', 'vCard file exported successfully'),
						autoHideTimeout: TIMEOUTS.defaultSnackbar,
						hideButton: true
					});
				})
				.catch((err) => {
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
