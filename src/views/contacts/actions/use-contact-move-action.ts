/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { useMoveContacts } from 'actions/common-contacts-actions/use-move-contacts';
import { Action } from 'actions/types';
import { Contact } from 'legacy/types/contact';

export const useContactMoveAction = (contact: Contact): Action => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.move_single.title', {
		contactDesc: `${contact.firstName} ${contact.lastName}`,
		defaultValue: "Move {{contactDesc}}'s contact"
	});
	return useMoveContacts([contact], modalTitle);
};
