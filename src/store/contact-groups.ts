/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-param-reassign */

import { differenceBy, findIndex } from 'lodash';
import { create } from 'zustand';

import { ContactGroup, SharedContactGroup } from '../model/contact-group';

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

type SharedAccountData = {
	hasMore: boolean;
	offset: number;
	contactGroups: Record<string, SharedContactGroup>;
};

type State = {
	contactGroups: Array<ContactGroup>;
	sharedContactGroups: Record<string, SharedAccountData>;
	offset: number;
};

export type ContactGroupStoreActions = {
	addContactGroups: (newContactGroups: Array<ContactGroup>) => void;
	getContactGroupsByFolderId: (folderId: string) => Array<ContactGroup>;
	getContactGroupById: (id: string) => ContactGroup | undefined;
	addContactGroup: (newContactGroup: ContactGroup) => void;
	updateContactGroup: (contactGroup: ContactGroup) => void;
	setOffset: (offset: number) => void;
	removeContactGroup: (contactGroupId: string) => void;
	reset: () => void;
};

export const initialState: State = {
	contactGroups: [],
	sharedContactGroups: {},
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
	getContactGroupsByFolderId: (folderId: string): Array<ContactGroup> => {
		const { contactGroups } = get();
		return contactGroups.filter((cg) => cg.folderId === folderId);
	},

	getContactGroupById: (id: string): ContactGroup | undefined => {
		const { contactGroups } = get();
		return contactGroups.find((cg) => cg.id === id);
	},

	updateContactGroup: (contactGroup): void => {
		const contactGroupId = contactGroup.id;
		const { contactGroups, offset } = get();
		const idxOfContactGroup = contactGroups.findIndex((item) => item.id === contactGroupId);
		contactGroups[idxOfContactGroup] = contactGroup;
		set(() => ({
			contactGroups
		}));
	},
	setOffset: (offset): void => set(() => ({ offset })),
	addContactGroups: (contactGroupsToAdd): void => {
		const { contactGroups } = get();

		const newGroups = differenceBy(contactGroups, contactGroupsToAdd, (cg) => cg.id);

		if (newGroups.length > 0) {
			set(() => ({
				contactGroups: [...(contactGroups ?? []), ...newGroups]
			}));
		}
	},

	removeContactGroup: (contactGroupId: string): void => {
		// TODO: check offset as the new view is by folder
		const { contactGroups, offset } = get();
		const contactExists =
			contactGroups.findIndex((contactGroup) => contactGroup.id === contactGroupId) >= 0;
		if (contactExists) {
			set(() => ({
				contactGroups: contactGroups.filter((contactGroup) => contactGroup.id !== contactGroupId),
				offset: offset - 1
			}));
		} else {
			throw new Error('Contact group not found');
		}
	},

	addContactGroup: (newContactGroup: ContactGroup): void => {
		const { contactGroups, offset } = get();
		const newContactGroups = [...contactGroups, newContactGroup];
		set(() => ({
			contactGroups: newContactGroups,
			offset: newContactGroups.length
		}));
	}
}));
