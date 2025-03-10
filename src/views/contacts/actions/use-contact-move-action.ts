/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';

import { useMoveContacts } from '../../../actions/common-contacts-actions/use-move-contacts';
import { UIAction } from '../../../actions/types';
import { Contact } from '../../../legacy/types/contact';

export const useContactMoveAction = (contact: Contact): UIAction<void, void> => {
	const [t] = useTranslation();
	const modalTitle = t('contact.modal.restore_single.title', {
		contactDesc: `${contact.firstName} ${contact.lastName}`,
		defaultValue: "Restore {{contactDesc}}'s contact"
	});
	return useMoveContacts([contact], modalTitle);
};
