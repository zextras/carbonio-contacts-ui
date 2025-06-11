/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Action } from 'actions/types';
import { TIMEOUTS } from 'constants/index';
import { EXPORT_CONTACT_ACTION } from 'constants/actions';
import { redirectToBlob } from 'helpers/download';
import { getDisplayName } from 'legacy/hooks/use-display-name';
import { Contact } from 'legacy/types/contact';
import { apiClient } from 'network/api-client';

const FILENAME_EXTENSION = 'vcf';
const MIME_TYPE = 'text/vcard';

export const useContactExportAction = (contact: Contact): Action => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const execute = useCallback(() => {
		const fileName = `${getDisplayName(contact) ?? contact.id}.${FILENAME_EXTENSION}`;

		apiClient
			.getItem(contact.id)
			.then((content) => {
				redirectToBlob(content, fileName, MIME_TYPE);
				createSnackbar({
					key: 'export-contact-success',
					replace: true,
					severity: 'info',
					label: t('export_contact.snackbar.success', 'vCard file exported successfully'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			})
			.catch(() => {
				createSnackbar({
					key: 'export-contact-error',
					replace: true,
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.defaultSnackbar,
					hideButton: true
				});
			});
	}, [contact, createSnackbar, t]);

	return useMemo(
		() => ({
			id: EXPORT_CONTACT_ACTION.ID,
			label: t('label.export_contact', 'Export vCard file'),
			icon: EXPORT_CONTACT_ACTION.ICON,
			onClick: execute
		}),
		[execute, t]
	);
};
