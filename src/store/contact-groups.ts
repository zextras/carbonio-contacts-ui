/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-param-reassign */

import produce from 'immer';
import { uniqBy } from 'lodash';
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
		const { contactGroups } = get();
		const idxOfContactGroup = contactGroups.findIndex((item) => item.id === contactGroupId);
		contactGroups[idxOfContactGroup] = contactGroup;
		set(() => ({
			contactGroups
		}));
	},
	setOffset: (offset): void => set(() => ({ offset })),
	addContactGroups: (contactGroupsToAdd): void => {
		set(
			produce(({ contactGroups }: State) => {
				const newGroups = uniqBy([...contactGroups, ...contactGroupsToAdd], 'id');

				return { contactGroups: newGroups };
			})
		);
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
