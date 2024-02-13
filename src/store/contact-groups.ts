/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { differenceBy, findIndex } from 'lodash';
import { create } from 'zustand';

import { ContactGroup } from '../model/contact-group';

function compareContactGroupName(nameA: string, nameB: string): number {
	const nameALow = nameA.toLowerCase();
	const nameBLow = nameB.toLowerCase();
	if (nameALow > nameBLow) {
		return 1;
	}
	if (nameBLow > nameALow) {
		return -1;
	}
	return 0;
}

type State = {
	orderedContactGroups: Array<ContactGroup>;
	unorderedContactGroups: Array<ContactGroup>;
	offset: number;
};

export type ContactGroupStoreActions = {
	addContactGroups: (newContactGroups: Array<ContactGroup>) => void;
	addContactGroupInSortedPosition: (newContactGroup: ContactGroup) => void;
	updateContactGroup: (contactGroup: ContactGroup) => void;
	setOffset: (offset: number) => void;
	removeContactGroup: (contactGroupId: string) => void;
	reset: () => void;
	// testing purpose
	setUnorderedContactGroups: (contactGroups: Array<ContactGroup>) => void;
};

export const initialState: State = {
	orderedContactGroups: [],
	unorderedContactGroups: [],
	offset: 0
};

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useContactGroupStore = create<State & ContactGroupStoreActions>()((set, get) => ({
	...initialState,
	setUnorderedContactGroups: (contactGroups): void => {
		set(() => ({
			unorderedContactGroups: contactGroups
		}));
	},
	reset: (): void => {
		set(initialState);
	},
	updateContactGroup: (contactGroup): void => {
		get().removeContactGroup(contactGroup.id);
		get().addContactGroupInSortedPosition(contactGroup);
	},
	setOffset: (offset): void => set(() => ({ offset })),
	addContactGroups: (contactGroups): void => {
		const { orderedContactGroups, unorderedContactGroups } = get();

		if (unorderedContactGroups.length > 0) {
			const unorderedResult = differenceBy(unorderedContactGroups, contactGroups, (cg) => cg.id);
			set(() => ({
				orderedContactGroups: [...(orderedContactGroups ?? []), ...contactGroups],
				unorderedContactGroups: unorderedResult
			}));
		} else {
			set(() => ({
				orderedContactGroups: [...(orderedContactGroups ?? []), ...contactGroups]
			}));
		}
	},
	removeContactGroup: (contactGroupId: string): void => {
		const { orderedContactGroups, unorderedContactGroups, offset } = get();
		const idx = orderedContactGroups.findIndex(
			(contactGroup) => contactGroup.id === contactGroupId
		);
		if (idx >= 0) {
			set(() => ({
				// TODO replace with Array toSpliced when will be available
				orderedContactGroups: orderedContactGroups.filter(
					(contactGroup) => contactGroup.id !== contactGroupId
				),
				offset: offset - 1
			}));
		} else {
			const uIdx = unorderedContactGroups.findIndex(
				(contactGroup) => contactGroup.id === contactGroupId
			);
			if (uIdx >= 0) {
				set(() => ({
					// TODO replace with Array toSpliced when will be available
					unorderedContactGroups: unorderedContactGroups.filter(
						(contactGroup) => contactGroup.id !== contactGroupId
					)
				}));
			} else {
				throw new Error('Contact group not found');
			}
		}
	},
	addContactGroupInSortedPosition: (newContactGroup: ContactGroup): void => {
		const { orderedContactGroups, unorderedContactGroups, offset } = get();

		const idx = findIndex(
			orderedContactGroups,
			(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
		);

		if (idx < orderedContactGroups.length && idx >= 0) {
			const result = [...orderedContactGroups];
			result.splice(idx, 0, newContactGroup);
			set(() => ({
				orderedContactGroups: result,
				offset: offset + 1
			}));
		} else if (unorderedContactGroups.length === 0) {
			set(() => ({ unorderedContactGroups: [newContactGroup] }));
		} else {
			const unorderedIdx = findIndex(
				unorderedContactGroups,
				(contactGroup) => compareContactGroupName(newContactGroup.title, contactGroup.title) < 0
			);
			const result = [...unorderedContactGroups];
			result.splice(unorderedIdx, 0, newContactGroup);
			set(() => ({
				unorderedContactGroups: result
			}));
		}
	}
}));
