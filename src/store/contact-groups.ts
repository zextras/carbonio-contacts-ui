/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { differenceBy, findIndex } from 'lodash';
import { create } from 'zustand';

import { ContactGroup } from '../model/contact-group';

export function compareContactGroupName(nameA: string, nameB: string): number {
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
};

export const initialState: State = {
	orderedContactGroups: [],
	unorderedContactGroups: [],
	offset: 0
};

/**
 * Note: this function will modify the contact Group arrays intentionally
 * */
// TODO refactor as pure function when Array toSpliced will be available
function addToProperList(
	ordered: Array<ContactGroup>,
	unOrdered: Array<ContactGroup>,
	cgToAdd: ContactGroup
): void {
	const idxToAdd = findIndex(
		ordered,
		(item) => compareContactGroupName(cgToAdd.title, item.title) < 0
	);
	if (idxToAdd < ordered.length && idxToAdd >= 0) {
		ordered.splice(idxToAdd, 0, cgToAdd);
	} else if (unOrdered.length === 0) {
		unOrdered.push(cgToAdd);
	} else {
		const unorderedIdxToAdd = findIndex(
			unOrdered,
			(item) => compareContactGroupName(cgToAdd.title, item.title) < 0
		);
		unOrdered.splice(unorderedIdxToAdd, 0, cgToAdd);
	}
}

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useContactGroupStore = create<State & ContactGroupStoreActions>()((set, get) => ({
	...initialState,
	reset: (): void => {
		set(initialState);
	},
	updateContactGroup: (contactGroup): void => {
		const { orderedContactGroups, unorderedContactGroups, offset } = get();
		const idxToRemove = orderedContactGroups.findIndex((item) => item.id === contactGroup.id);

		const newOrderedContactGroups = [...orderedContactGroups];
		const newUnorderedContactGroups = [...unorderedContactGroups];
		if (idxToRemove >= 0) {
			newOrderedContactGroups.splice(idxToRemove, 1);
			addToProperList(newOrderedContactGroups, newUnorderedContactGroups, contactGroup);
			set(() => ({
				orderedContactGroups: newOrderedContactGroups,
				unorderedContactGroups: newUnorderedContactGroups,
				offset:
					newOrderedContactGroups.length === orderedContactGroups.length || offset === -1
						? offset
						: offset + newOrderedContactGroups.length - orderedContactGroups.length
			}));
		} else {
			const uIdxToRemove = unorderedContactGroups.findIndex((item) => item.id === contactGroup.id);
			if (uIdxToRemove >= 0) {
				newUnorderedContactGroups.splice(uIdxToRemove, 1);
				addToProperList(newOrderedContactGroups, newUnorderedContactGroups, contactGroup);
				set(() => ({
					orderedContactGroups: newOrderedContactGroups,
					unorderedContactGroups: newUnorderedContactGroups,
					offset:
						newOrderedContactGroups.length === orderedContactGroups.length || offset === -1
							? offset
							: offset + newOrderedContactGroups.length - orderedContactGroups.length
				}));
			} else {
				throw new Error('Contact group not found');
			}
		}
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
		const newOrderedContactGroups = [...orderedContactGroups];
		const newUnorderedContactGroups = [...unorderedContactGroups];
		addToProperList(newOrderedContactGroups, newUnorderedContactGroups, newContactGroup);
		set(() => ({
			orderedContactGroups: newOrderedContactGroups,
			unorderedContactGroups: newUnorderedContactGroups,
			offset:
				newOrderedContactGroups.length === orderedContactGroups.length || offset === -1
					? offset
					: offset + newOrderedContactGroups.length - orderedContactGroups.length
		}));
	}
}));
