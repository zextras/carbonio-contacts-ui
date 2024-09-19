/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBoard } from '@zextras/carbonio-shell-ui';

import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useGetContactGroupFromBoardId = (): ContactGroup | undefined => {
	const { context } = useBoard<{ contactGroupId: string }>();

	const contactGroupId = context?.contactGroupId;
	const contactGroups = useContactGroupStore((state) => state.orderedContactGroups);
	const unOrderedContactGroups = useContactGroupStore((state) => state.unorderedContactGroups);
	const sharedContactGroups = useContactGroupStore((state) => state.sharedContactGroups);
	if (!contactGroupId) return undefined;

	const { zid: accountId } = getFolderIdParts(contactGroupId);
	if (accountId) {
		return sharedContactGroups[accountId][contactGroupId];
	}

	return [...contactGroups, ...unOrderedContactGroups].find(
		(contactGroupElement) => contactGroupElement.id === contactGroupId
	);
};
