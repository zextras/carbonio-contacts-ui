/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useParams } from 'react-router-dom';

import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useActiveContactGroup = (): ContactGroup | undefined => {
	const { id: contactGroupId } = useParams<{ id: string }>();
	const contactGroups = useContactGroupStore((state) => state.orderedContactGroups);
	const unOrderedContactGroups = useContactGroupStore((state) => state.unorderedContactGroups);

	return [...contactGroups, ...unOrderedContactGroups].find(
		(contactGroup) => contactGroup.id === contactGroupId
	);
};
