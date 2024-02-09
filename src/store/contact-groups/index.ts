/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { differenceBy, findIndex } from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { ContactGroup } from '../../model/contact-group';

function compareContactGroupName(nameA: string, nameB: string): number {
	if (nameA > nameB) {
		return 1;
	}
	if (nameB > nameA) {
		return -1;
	}
	return 0;
}

export type ContactGroupsState = {
	orderedContactGroups: Array<ContactGroup>;
	unorderedContactGroups: Array<ContactGroup>;
	addContactGroups: (newContactGroups: Array<ContactGroup>) => void;
	addContactGroupInSortedPosition: (newContactGroup: ContactGroup) => void;
	updateContactGroup: (contactGroup: ContactGroup) => void;
	offset: number;
	setOffset: (offset: number) => void;
	emptyContactGroups: () => void;
	removeContactGroup: (contactGroupId: string) => void;
};

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useContactGroupStore = create<ContactGroupsState>()(
	devtools((set, get) => ({
		orderedContactGroups: [],
		unorderedContactGroups: [],
		offset: 0,
		updateContactGroup: (contactGroup): void =>
			set(() => ({
				orderedContactGroups: get().orderedContactGroups.map((cg) =>
					cg.id === contactGroup.id ? contactGroup : cg
				)
			})),
		setOffset: (offset): void => set(() => ({ offset })),
		addContactGroups: (contactGroups): void => {
			const unordered = get().unorderedContactGroups;
			if (unordered.length > 0) {
				const unorderedResult = differenceBy(unordered, contactGroups, (cg) => cg.id);
				set(() => ({
					orderedContactGroups: [...(get().orderedContactGroups ?? []), ...contactGroups],
					unorderedContactGroups: unorderedResult
				}));
			} else {
				set(() => ({
					orderedContactGroups: [...(get().orderedContactGroups ?? []), ...contactGroups]
				}));
			}
		},
		emptyContactGroups: (): void =>
			set(() => ({ orderedContactGroups: [], unorderedContactGroups: [] })),
		removeContactGroup: (contactGroupId: string): void => {
			const idx = get().orderedContactGroups.findIndex(
				(contactGroup) => contactGroup.id === contactGroupId
			);
			if (idx >= 0) {
				set(() => ({
					// TODO replace with Array toSpliced when will be available
					orderedContactGroups: get().orderedContactGroups.filter(
						(contactGroup) => contactGroup.id !== contactGroupId
					),
					offset: get().offset - 1
				}));
			} else {
				throw new Error('Contact group not found');
			}
		},
		addContactGroupInSortedPosition: (newContactGroup: ContactGroup): void => {
			const prevContactGroups = get().orderedContactGroups;

			const idx = findIndex(
				prevContactGroups,
				(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
			);

			if (idx < prevContactGroups.length && idx >= 0) {
				const result = [...prevContactGroups];
				result.splice(idx, 0, newContactGroup);
				set(() => ({ orderedContactGroups: result, offset: get().offset + 1 }));
			} else {
				const prevUnorderedContactGroups = get().unorderedContactGroups;
				if (prevUnorderedContactGroups.length === 0) {
					set(() => ({ unorderedContactGroups: [newContactGroup] }));
				} else {
					const unorderedIdx = findIndex(
						prevUnorderedContactGroups,
						(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
					);
					set(() => ({
						unorderedContactGroups: [...prevUnorderedContactGroups].splice(
							unorderedIdx,
							0,
							newContactGroup
						)
					}));
				}
			}
		}
	}))
);
