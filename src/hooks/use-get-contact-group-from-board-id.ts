/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBoard } from '@zextras/carbonio-shell-ui';

import { useContactGroupById } from '../legacy/store/contacts';
import { ContactGroup } from '../model/contact-group';

export const useGetContactGroupFromBoardId = (): ContactGroup | undefined => {
	const { context } = useBoard<{ contactGroupId: string; folderId: string }>();
	const contact = useContactGroupById(context?.contactGroupId as string);

	if (!context) return undefined;

	return contact;
};
