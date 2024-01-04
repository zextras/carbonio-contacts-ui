/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useActiveItem } from './useActiveItem';
import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useActiveContactGroup = (): ContactGroup | undefined => {
	const contactGroups = useContactGroupStore((state) => state.storedContactGroups);

	const { activeItem } = useActiveItem();

	return contactGroups.find((contactGroup) => contactGroup.id === activeItem);
};
