/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Action } from '../../../actions/types';
import { Contact } from '../../../legacy/types/contact';

export const useContactEditAction = (contact: Contact): Action => {
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
		icon: 'Edit2Outline',
		label: t('label.edit'),
		onClick: onEdit
	};
};
