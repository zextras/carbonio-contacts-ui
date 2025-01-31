/* eslint-disable no-param-reassign */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { selectContactGroup } from './contacts';
import { buildContactGroup } from '../../../tests/model-builder';
import { generateStore } from '../../tests/generators/store';

// TODO: store is merged with contacts, test reducers on that store
describe('Contact groups store', () => {
	// it('should return 0 as default offset', () => {
	// 	expect(useContactGroupStore.getState().offset).toBe(0);
	// });

	it('should return the requested contact group', () => {
		const contactGroup1 = buildContactGroup();
		const store = generateStore({
			contacts: {
				contacts: {
					'1': [contactGroup1]
				},
				status: {},
				searchedInFolder: {}
			}
		});

		const result = selectContactGroup(store.getState(), '1', contactGroup1.id);

		expect(result).toEqual(contactGroup1);
	});

	// describe('AddContactGroups action', () => {
	// 	it('should return the list which has been set', () => {
	// 		const list = times(3, () => buildContactGroup());
	// 		addContactGroups(list);
	// 		expect(useContactGroupStore.getState().contactGroups).toEqual(list);
	// 	});
	//
	// 	it('should add items to existing items', () => {
	// 		const list1 = times(3, () => buildContactGroup());
	// 		const list2 = times(2, () => buildContactGroup());
	// 		addContactGroups(list1);
	// 		addContactGroups(list2);
	// 		expect(useContactGroupStore.getState().contactGroups).toEqual([...list1, ...list2]);
	// 	});
	//
	// 	it('should remove duplicated elements if present in addContactGroups list', () => {
	// 		const list = times(10, () => buildContactGroup({ id: '1' }));
	//
	// 		addContactGroups(list);
	//
	// 		expect(useContactGroupStore.getState().contactGroups).toHaveLength(1);
	// 	});
	// });
	//
	// describe('RemoveContactGroup action', () => {
	// 	it('should remove element from list when present and decrement offset', () => {
	// 		const contactGroup = buildContactGroup();
	// 		addContactGroups([contactGroup]);
	// 		removeContactGroup(contactGroup.id);
	// 		expect(useContactGroupStore.getState().contactGroups).toHaveLength(0);
	// 		expect(useContactGroupStore.getState().offset).toBe(-1);
	// 	});
	//
	// 	it('should throw error when not present', () => {
	// 		const contactGroup = buildContactGroup();
	// 		expect(() => removeContactGroup(contactGroup.id)).toThrow('Contact group not found');
	// 	});
	// });
	//
	// it('should reset initial state when call reset action', () => {
	// 	const list = times(8, () => buildContactGroup());
	// 	list.sort((a, b) => compareContactGroupName(a.title, b.title));
	// 	const unorderedCG = list.splice(list.length - 1, 1)[0];
	//
	// 	addContactGroups(list);
	// 	useContactGroupStore.getState().addContactGroup(unorderedCG);
	// 	useContactGroupStore.getState().setOffset(100);
	// 	useContactGroupStore.getState().reset();
	//
	// 	expect(useContactGroupStore.getState().contactGroups).toBe(initialState.contactGroups);
	// 	expect(useContactGroupStore.getState().offset).toBe(initialState.offset);
	// });
});
