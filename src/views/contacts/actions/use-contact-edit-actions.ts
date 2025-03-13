/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getParentFolder } from '../../../actions/folder-utils';
import { Action } from '../../../actions/types';
import { EDIT_ACTION } from '../../../constants/actions';
import { Contact } from '../../../legacy/types/contact';

export const useContactEditAction = (contact: Contact): Action => {
	const [t] = useTranslation();
	const folderId = getParentFolder(contact)?.id;
	const navigate = useNavigate();
	const contactInternalId = contact.id;
	const onEdit = useCallback(
		() => navigate(`../folder/${folderId}/edit/${contactInternalId}`),
		[contactInternalId, folderId, navigate]
	);
	return {
		id: EDIT_ACTION.ID,
		icon: EDIT_ACTION.ICON,
		label: t('label.edit'),
		onClick: onEdit
	};
};
