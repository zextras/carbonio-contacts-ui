/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useParams } from 'react-router-dom';

import { getFolderIdParts } from '../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useGetContactGroupFromPath = (): ContactGroup | undefined => {
	const { id: contactGroupId } = useParams<{ id: string }>();

	const { id: itemId, zid: accountId } = getFolderIdParts(contactGroupId);
	const contactGroups = useContactGroupStore((state) => state.orderedContactGroups);
	const unOrderedContactGroups = useContactGroupStore((state) => state.unorderedContactGroups);

	if (!itemId) return undefined;

	const contactGroup = [...contactGroups, ...unOrderedContactGroups].find(
		(item) => item.id === itemId
	);

	if (!accountId) return contactGroup;

	const sharedContactGroupAccounts = useContactGroupStore
		.getState()
		.getSharedContactGroupsByAccountId(accountId);
	return sharedContactGroupAccounts.find(
		(sharedContactGroup) => sharedContactGroup.id === contactGroupId
	);
};
