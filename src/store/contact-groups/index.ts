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
	storedContactGroups: Array<ContactGroup>;
	unorderedStoredContactGroups: Array<ContactGroup>;
	addStoredContactGroups: (newContactGroups: Array<ContactGroup>) => void;
	addStoredContactGroupInSortedPosition: (newContactGroup: ContactGroup) => void;
	updateContactGroup: (contactGroup: ContactGroup) => void;
	storedOffset: number;
	setStoredOffset: (offset: number) => void;
	emptyStoredContactGroups: () => void;
	removeStoredContactGroup: (contactGroupId: string) => void;
};

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useContactGroupStore = create<ContactGroupsState>()(
	devtools((set, get) => ({
		storedContactGroups: [],
		unorderedStoredContactGroups: [],
		storedOffset: 0,
		updateContactGroup: (contactGroup): void =>
			set(() => ({
				storedContactGroups: get().storedContactGroups.map((cg) =>
					cg.id === contactGroup.id ? contactGroup : cg
				)
			})),
		setStoredOffset: (offset): void => set(() => ({ storedOffset: offset })),
		addStoredContactGroups: (contactGroups): void => {
			const unordered = get().unorderedStoredContactGroups;
			if (unordered.length > 0) {
				const unorderedResult = differenceBy(unordered, contactGroups, (cg) => cg.id);
				set(() => ({
					storedContactGroups: [...(get().storedContactGroups ?? []), ...contactGroups],
					unorderedStoredContactGroups: unorderedResult
				}));
			} else {
				set(() => ({
					storedContactGroups: [...(get().storedContactGroups ?? []), ...contactGroups]
				}));
			}
		},
		emptyStoredContactGroups: (): void => set(() => ({ storedContactGroups: [] })),
		removeStoredContactGroup: (contactGroupId: string): void => {
			const idx = get().storedContactGroups.findIndex(
				(contactGroup) => contactGroup.id === contactGroupId
			);
			if (idx >= 0) {
				set(() => ({
					// TODO replace with Array toSpliced when will be available
					storedContactGroups: get().storedContactGroups.filter(
						(contactGroup) => contactGroup.id !== contactGroupId
					),
					storedOffset: get().storedOffset - 1
				}));
			} else {
				throw new Error('Contact group not found');
			}
		},
		addStoredContactGroupInSortedPosition: (newContactGroup: ContactGroup): void => {
			const prevStoredContactGroups = get().storedContactGroups;

			const idx = findIndex(
				prevStoredContactGroups,
				(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
			);

			if (idx < prevStoredContactGroups.length && idx >= 0) {
				const result = [...prevStoredContactGroups];
				result.splice(idx, 0, newContactGroup);
				set(() => ({ storedContactGroups: result, storedOffset: get().storedOffset + 1 }));
			} else {
				const prevUnorderedStoredContactGroups = get().unorderedStoredContactGroups;
				if (prevUnorderedStoredContactGroups.length === 0) {
					set(() => ({ unorderedStoredContactGroups: [newContactGroup] }));
				} else {
					const unorderedIdx = findIndex(
						prevUnorderedStoredContactGroups,
						(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
					);
					set(() => ({
						unorderedStoredContactGroups: [...prevUnorderedStoredContactGroups].splice(
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
