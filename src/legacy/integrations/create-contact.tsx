/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';

import { apiClient } from '../../network/api-client';

type CreateContactContextType = {
	messageId: string;
	part: string;
};

const createContactIntegration =
	(createSnackbar: CreateSnackbarFn, t: TFunction) =>
	(context: CreateContactContextType): void => {
		apiClient
			.createContactFromVcard(context.messageId, context.part)
			.then(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'success',
					label: t(
						'import_contacts.snackbar.contact_import_success',
						'Contact imported in your address book successfully.'
					)
				});
			})
			.catch(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again')
				});
			});
	};

export default createContactIntegration;
