/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { UIAction } from '../../../actions/types';
import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { Contact } from '../../../legacy/types/contact';

export const useContactEditAction = (contact: Contact): UIAction<void, void> => {
	const [t] = useTranslation();
	const folderId = contact.parent;
	const navigate = useNavigate();
	const contactInternalId = contact.id;
	const onEdit = useCallback(
		() => navigate(`../folder/${folderId}/edit/${contactInternalId}`),
		[contactInternalId, folderId, navigate]
	);
	return {
		id: 'edit',
		icon: 'EditOutline',
		label: t('label.edit'),
		execute: onEdit,
		canExecute: () => !isTrash(contact.parent)
	};
};
