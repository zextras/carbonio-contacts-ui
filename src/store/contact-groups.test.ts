/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { times } from 'lodash';

import { ContactGroupStoreActions, initialState, useContactGroupStore } from './contact-groups';
import { buildContactGroup } from '../tests/model-builder';

const addContactGroups: ContactGroupStoreActions['addContactGroups'] = (newContactGroups) =>
	useContactGroupStore.getState().addContactGroups(newContactGroups);

const setUnorderedContactGroups: ContactGroupStoreActions['setUnorderedContactGroups'] = (
	contactGroups
) => useContactGroupStore.getState().setUnorderedContactGroups(contactGroups);

const removeContactGroup: ContactGroupStoreActions['removeContactGroup'] = (contactGroupId) =>
	useContactGroupStore.getState().removeContactGroup(contactGroupId);
describe('Contact groups store', () => {
	it('should return an empty list of orderedContactGroups if no value has been set', () => {
		expect(useContactGroupStore.getState().orderedContactGroups).toHaveLength(0);
	});

	it('should return an empty list of unorderedContactGroups if no value has been set', () => {
		expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
	});

	it('should return 0 as default offset', () => {
		expect(useContactGroupStore.getState().offset).toBe(0);
	});

	describe('AddContactGroups action', () => {
		it('should return the list which has been set', () => {
			const list = times(3, () => buildContactGroup());
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
		});

		it('should add items to existing ordered items', () => {
			const list1 = times(3, () => buildContactGroup());
			const list2 = times(2, () => buildContactGroup());
			addContactGroups(list1);
			addContactGroups(list2);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual([...list1, ...list2]);
		});

		it('should remove unordered elements if present in addContactGroups list', () => {
			const unorderedCG = buildContactGroup();
			setUnorderedContactGroups([unorderedCG]);
			const list1 = [...times(3, () => buildContactGroup()), unorderedCG];
			addContactGroups(list1);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list1);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
		});

		it('should not remove unordered elements if not present in addContactGroups list', () => {
			const unorderedCG = buildContactGroup();
			setUnorderedContactGroups([unorderedCG]);
			const list1 = times(3, () => buildContactGroup());
			addContactGroups(list1);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list1);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);
		});
	});

	describe('RemoveContactGroup action', () => {
		it('should remove element from ordered list when present and decrement offset', () => {
			const contactGroup = buildContactGroup();
			addContactGroups([contactGroup]);
			removeContactGroup(contactGroup.id);
			expect(useContactGroupStore.getState().orderedContactGroups).toHaveLength(0);
			expect(useContactGroupStore.getState().offset).toBe(-1);
		});

		it('should remove element from unOrdered list when present and not decrement offset', () => {
			const contactGroup = buildContactGroup();
			setUnorderedContactGroups([contactGroup]);
			removeContactGroup(contactGroup.id);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
			expect(useContactGroupStore.getState().offset).toBe(0);
		});
		it('should throw error when not present', () => {
			const contactGroup = buildContactGroup();
			expect(() => removeContactGroup(contactGroup.id)).toThrow('Contact group not found');
		});
	});

	it('should reset initial state when call reset action', () => {
		const list1 = times(3, () => buildContactGroup());
		const list2 = times(3, () => buildContactGroup());
		addContactGroups(list1);
		setUnorderedContactGroups(list2);
		useContactGroupStore.getState().setOffset(100);

		useContactGroupStore.getState().reset();

		expect(useContactGroupStore.getState().orderedContactGroups).toBe(
			initialState.orderedContactGroups
		);
		expect(useContactGroupStore.getState().unorderedContactGroups).toBe(
			initialState.unorderedContactGroups
		);
		expect(useContactGroupStore.getState().offset).toBe(initialState.offset);
	});
});
