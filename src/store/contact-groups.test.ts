/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { dropRight, first, last, nth, times } from 'lodash';

import {
	compareContactGroupName,
	ContactGroupStoreActions,
	initialState,
	useContactGroupStore
} from './contact-groups';
import { buildContactGroup } from '../tests/model-builder';

const addContactGroups: ContactGroupStoreActions['addContactGroups'] = (newContactGroups) =>
	useContactGroupStore.getState().addContactGroups(newContactGroups);

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
			const list = times(8, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			const unorderedCG = list.splice(list.length - 1, 1)[0];

			addContactGroups(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(unorderedCG);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);

			addContactGroups([unorderedCG]);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual([...list, unorderedCG]);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
		});

		it('should not remove unordered elements if not present in addContactGroups list', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			const unorderedCG = list.splice(list.length - 1, 1)[0];

			const page1 = list.splice(0, 10);
			const page2 = list.splice(-10);

			addContactGroups(page1);
			useContactGroupStore.getState().addContactGroupInSortedPosition(unorderedCG);

			addContactGroups(page2);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual([...page1, ...page2]);
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
			const list = times(8, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			const unorderedCG = list.splice(list.length - 1, 1)[0];

			addContactGroups(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(unorderedCG);

			removeContactGroup(unorderedCG.id);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
			expect(useContactGroupStore.getState().offset).toBe(0);
		});
		it('should throw error when not present', () => {
			const contactGroup = buildContactGroup();
			expect(() => removeContactGroup(contactGroup.id)).toThrow('Contact group not found');
		});
	});

	it('should reset initial state when call reset action', () => {
		const list = times(8, () => buildContactGroup());
		list.sort((a, b) => compareContactGroupName(a.title, b.title));
		const unorderedCG = list.splice(list.length - 1, 1)[0];

		addContactGroups(list);
		useContactGroupStore.getState().addContactGroupInSortedPosition(unorderedCG);
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

	describe('AddContactGroupInSortedPosition action', () => {
		it('should add an element in the middle in the ordered list and increment offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const listCopy = [...list];
			const elementInTheMiddle = list.splice(10, 1)[0];
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(elementInTheMiddle);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(listCopy);
			expect(useContactGroupStore.getState().offset).toEqual(1);
		});

		it('should add an element in the middle in the ordered list and keep offset to -1 if already -1', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			const listCopy = [...list];

			const elementInTheMiddle = list.splice(10, 1)[0];
			addContactGroups(list);
			useContactGroupStore.getState().setOffset(-1);
			useContactGroupStore.getState().addContactGroupInSortedPosition(elementInTheMiddle);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(listCopy);
			expect(useContactGroupStore.getState().offset).toEqual(-1);
		});

		it('should add the secondLast element in the ordered list and increment offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const listCopy = [...list];
			const secondLast = list.splice(list.length - 2, 1)[0];
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(secondLast);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(listCopy);
			expect(useContactGroupStore.getState().offset).toEqual(1);
		});
		it('should add the last element in the unordered list and not increment offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const last = list.splice(list.length - 1, 1)[0];
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(last);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			expect(useContactGroupStore.getState().unorderedContactGroups).toEqual([last]);
			expect(useContactGroupStore.getState().offset).toEqual(0);
		});
		it('should add the last secondLast and thirdLast element in the unordered list, sort the unordered list and not increment offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const last = list.splice(list.length - 1, 1)[0];
			const secondLast = list.splice(list.length - 1, 1)[0];
			const thirdLast = list.splice(list.length - 1, 1)[0];
			addContactGroups(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(last);
			useContactGroupStore.getState().addContactGroupInSortedPosition(thirdLast);
			useContactGroupStore.getState().addContactGroupInSortedPosition(secondLast);

			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			expect(useContactGroupStore.getState().unorderedContactGroups).toEqual([
				thirdLast,
				secondLast,
				last
			]);
			expect(useContactGroupStore.getState().offset).toEqual(0);
		});

		it('should add element with the same name of the last element in the unordered list', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const withSameNameOfLast = buildContactGroup({ title: last(list)?.title });
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(withSameNameOfLast);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			expect(useContactGroupStore.getState().unorderedContactGroups).toEqual([withSameNameOfLast]);
			expect(useContactGroupStore.getState().offset).toEqual(0);
		});
	});

	describe('UpdateContactGroup action', () => {
		it('should not change order when update members', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			addContactGroups(list);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(list);
			useContactGroupStore
				.getState()
				.updateContactGroup({ ...list[10], members: [faker.internet.email()] });
			expect(useContactGroupStore.getState().orderedContactGroups.map((item) => item.id)).toEqual(
				list.map((item) => item.id)
			);
			expect(
				useContactGroupStore.getState().orderedContactGroups.map((item) => item.title)
			).toEqual(list.map((item) => item.title));
		});

		it('should move element from ordered to unordered list when renamed over the last element name and decrement offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			addContactGroups(list);
			useContactGroupStore.getState().setOffset(20);
			expect(useContactGroupStore.getState().offset).toEqual(20);
			useContactGroupStore.getState().updateContactGroup({
				...list[10],
				title: `${last(list)?.title}${faker.string.sample(2)}`
			});
			expect(useContactGroupStore.getState().orderedContactGroups).toHaveLength(list.length - 1);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);
			expect(useContactGroupStore.getState().offset).toEqual(19);
		});

		it('should move element from ordered to unordered list when renamed over the last element name and keep offset to -1 if already -1', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			addContactGroups(list);
			// it means more is false
			useContactGroupStore.getState().setOffset(-1);
			expect(useContactGroupStore.getState().offset).toEqual(-1);
			useContactGroupStore.getState().updateContactGroup({
				...list[10],
				title: `${last(list)?.title}${faker.string.sample(2)}`
			});
			expect(useContactGroupStore.getState().orderedContactGroups).toHaveLength(list.length - 1);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);
			expect(useContactGroupStore.getState().offset).toEqual(-1);
		});

		it('should update position in ordered list when update the display name with a name before the last element name', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));
			const listCopy = [...list];
			addContactGroups(list);
			const updatedElement = {
				...list[10],
				title: `${nth(list, -2)?.title}${faker.string.sample(2)}`
			};
			useContactGroupStore.getState().updateContactGroup(updatedElement);
			listCopy.splice(10, 1);
			listCopy.splice(listCopy.length - 1, 0, updatedElement);
			expect(useContactGroupStore.getState().orderedContactGroups).toHaveLength(list.length);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual(listCopy);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
		});

		it('should update the position of an unorderd contact group when the name change to a ordered one and increment offset', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const last = list.splice(list.length - 1, 1)[0];
			addContactGroups(list);
			useContactGroupStore.getState().setOffset(20);
			expect(useContactGroupStore.getState().offset).toEqual(20);
			useContactGroupStore.getState().addContactGroupInSortedPosition(last);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);
			const updatedElement = {
				...last,
				title: dropRight(first(list)?.title).join('')
			};
			useContactGroupStore.getState().updateContactGroup(updatedElement);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual([
				updatedElement,
				...list
			]);
			expect(useContactGroupStore.getState().offset).toEqual(21);
		});

		it('should update the position of an unorderd contact group when the name change to a ordered one and keep offset to -1 if already -1', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const last = list.splice(list.length - 1, 1)[0];
			addContactGroups(list);
			useContactGroupStore.getState().setOffset(-1);
			expect(useContactGroupStore.getState().offset).toEqual(-1);
			useContactGroupStore.getState().addContactGroupInSortedPosition(last);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(1);
			const updatedElement = {
				...last,
				title: dropRight(first(list)?.title).join('')
			};
			useContactGroupStore.getState().updateContactGroup(updatedElement);
			expect(useContactGroupStore.getState().unorderedContactGroups).toHaveLength(0);
			expect(useContactGroupStore.getState().orderedContactGroups).toEqual([
				updatedElement,
				...list
			]);
			expect(useContactGroupStore.getState().offset).toEqual(-1);
		});

		it('should update the position of an unordered contact group when the name change to a different unordered one', () => {
			const list = times(20, () => buildContactGroup());
			list.sort((a, b) => compareContactGroupName(a.title, b.title));

			const last = list.splice(list.length - 1, 1)[0];
			const secondLast = list.splice(list.length - 1, 1)[0];
			const thirdLast = list.splice(list.length - 1, 1)[0];
			addContactGroups(list);
			useContactGroupStore.getState().addContactGroupInSortedPosition(last);
			useContactGroupStore.getState().addContactGroupInSortedPosition(thirdLast);
			useContactGroupStore.getState().addContactGroupInSortedPosition(secondLast);
			expect(useContactGroupStore.getState().unorderedContactGroups).toEqual([
				thirdLast,
				secondLast,
				last
			]);

			const updatedElement = {
				...last,
				title: dropRight(thirdLast?.title).join('')
			};
			useContactGroupStore.getState().updateContactGroup(updatedElement);
			expect(useContactGroupStore.getState().unorderedContactGroups).toEqual([
				updatedElement,
				thirdLast,
				secondLast
			]);
		});
	});
});
