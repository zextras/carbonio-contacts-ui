/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

import { ContactGroup } from '../../model/contact-group';

export type ContactGroupsState = {
	storedContactGroups: Array<ContactGroup>;
	addStoredContactGroups: (newContactGroups: Array<ContactGroup>) => void;
	updateContactGroup: (contactGroup: ContactGroup) => void;
	storedOffset: number;
	setStoredOffset: (offset: number) => void;
	emptyStoredContactGroups: () => void;
	removeStoredContactGroup: (contactGroupId: string) => void;
	getStoredContactGroup: (contactGroupId: string) => ContactGroup | undefined;
};

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useContactGroupStore = create<ContactGroupsState>()((set, get) => ({
	storedContactGroups: [],
	storedOffset: 0,
	updateContactGroup: (contactGroup): void =>
		set(() => ({
			storedContactGroups: get().storedContactGroups.map((cg) =>
				cg.id === contactGroup.id ? contactGroup : cg
			)
		})),
	setStoredOffset: (offset): void => set(() => ({ storedOffset: offset })),
	addStoredContactGroups: (contactGroups): void =>
		set(() => ({ storedContactGroups: [...(get().storedContactGroups ?? []), ...contactGroups] })),
	emptyStoredContactGroups: (): void => set(() => ({ storedContactGroups: [] })),
	removeStoredContactGroup: (contactGroupId): void =>
		set(() => ({
			storedContactGroups: get().storedContactGroups.filter(
				(contactGroup) => contactGroup.id !== contactGroupId
			),
			storedOffset: get().storedOffset - 1
		})),
	getStoredContactGroup: (contactGroupId): ContactGroup | undefined =>
		get().storedContactGroups.find(
			(contactGroupElement) => contactGroupElement.id === contactGroupId
		)
}));
