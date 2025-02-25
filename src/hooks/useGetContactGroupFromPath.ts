/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useParams } from 'react-router-dom';

import { useAppSelector } from '../legacy/hooks/redux';
import { selectContactGroup } from '../legacy/store/selectors/contacts';
import { ContactGroup } from '../model/contact-group';

export const useGetContactGroupFromPath = (): ContactGroup | undefined => {
	const { id: contactGroupId, folderId } = useParams<{ id: string; folderId: string }>();
	return useAppSelector((state) => selectContactGroup(state, folderId!, contactGroupId!));
};
