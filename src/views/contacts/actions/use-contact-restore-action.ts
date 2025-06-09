/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { useRestoreContacts } from 'actions/common-contacts-actions/use-restore-contacts';
import { Action } from 'actions/types';
import { Contact } from 'legacy/types/contact';

export const useContactRestoreAction = (contact: Contact): Action => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.restore_single.title', {
		contactDesc: `${contact.firstName} ${contact.lastName}`,
		defaultValue: "Restore {{contactDesc}}'s contact"
	});
	return useRestoreContacts([contact], modalTitle);
};
