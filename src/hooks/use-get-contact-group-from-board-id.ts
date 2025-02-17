/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBoard } from '@zextras/carbonio-shell-ui';

import { useAppSelector } from '../legacy/hooks/redux';
import { ContactGroup } from '../model/contact-group';

export const useGetContactGroupFromBoardId = (): ContactGroup | undefined => {
	const { context } = useBoard<{ contactGroupId: string; folderId: string }>();
	const contacts = useAppSelector((state) => state.contacts);

	if (!context) return undefined;

	return contacts.contacts[context.folderId]?.find(
		(contact) => contact.id === context.contactGroupId
	) as ContactGroup | undefined;
};
