/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useGetMainAccountContactGroup = (contactGroupId: string): ContactGroup | undefined => {
	const contactGroups = useContactGroupStore((state) => state.orderedContactGroups);
	const unOrderedContactGroups = useContactGroupStore((state) => state.unorderedContactGroups);

	if (!contactGroupId) return undefined;

	return [...contactGroups, ...unOrderedContactGroups].find((item) => item.id === contactGroupId);
};
