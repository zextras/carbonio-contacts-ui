/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useParams } from 'react-router-dom';

import { useContactGroupById } from 'legacy/store/contacts';
import { ContactGroup } from 'model/contact-group';

export const useGetContactGroupFromPath = (): ContactGroup | undefined => {
	const { id: contactGroupId } = useParams<{ id: string; folderId: string }>();
	return useContactGroupById(contactGroupId ?? '');
};
