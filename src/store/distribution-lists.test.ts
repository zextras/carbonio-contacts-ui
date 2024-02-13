/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { StoredDistributionList, useDistributionListsStore } from './distribution-lists';
import { generateDistributionList, generateDistributionListMembersPage } from '../tests/utils';

describe('Distribution lists store', () => {
	it('should return an undefined list if no value has been set', () => {
		expect(useDistributionListsStore.getState().distributionLists).toBeUndefined();
	});

	it('should return the list which has been set', () => {
		const list = times(3, () => generateDistributionList());
		useDistributionListsStore.getState().setDistributionLists(list);
		expect(useDistributionListsStore.getState().distributionLists).toEqual(list);
	});

	it('should replace the entire list on set', () => {
		const list1 = times(3, () => generateDistributionList());
		const list2 = times(2, () => generateDistributionList());
		useDistributionListsStore.getState().setDistributionLists(list1);
		useDistributionListsStore.getState().setDistributionLists(list2);
		expect(useDistributionListsStore.getState().distributionLists).toEqual(list2);
	});

	it('should set list to initial state on reset', () => {
		const list = times(3, () => generateDistributionList());
		useDistributionListsStore.getState().setDistributionLists(list);
		useDistributionListsStore.getState().reset();
		expect(useDistributionListsStore.getState().distributionLists).toBeUndefined();
	});

	it('should update an existing distribution list on upsert', () => {
		const dl = generateDistributionList();
		const updatedDL = generateDistributionList({ id: dl.id, email: dl.email });
		useDistributionListsStore.getState().setDistributionLists([dl]);
		useDistributionListsStore.getState().upsertDistributionList(updatedDL);
		expect(useDistributionListsStore.getState().distributionLists).toContainEqual(updatedDL);
		expect(useDistributionListsStore.getState().distributionLists).not.toContainEqual(dl);
	});

	it('should add a new distribution list on upsert', () => {
		const dl = generateDistributionList();
		const dl2: StoredDistributionList = { email: faker.internet.email(), canRequireMembers: true };
		useDistributionListsStore.getState().setDistributionLists([dl]);
		useDistributionListsStore.getState().upsertDistributionList(dl2);
		expect(useDistributionListsStore.getState().distributionLists).toContainEqual(dl2);
		expect(useDistributionListsStore.getState().distributionLists).toContainEqual(dl);
	});

	it('should update existing distribution list position on upsert if display name change', () => {
		const dl = generateDistributionList({ displayName: 'position-1' });
		const dl0 = generateDistributionList({ displayName: 'position-0' });
		const dl2 = generateDistributionList({ displayName: 'position-2' });
		const dl4 = generateDistributionList({ displayName: 'position-4' });
		const updatedDL = generateDistributionList({
			id: dl.id,
			email: dl.email,
			displayName: 'position-3'
		});
		useDistributionListsStore.getState().setDistributionLists([dl0, dl, dl2, dl4]);
		useDistributionListsStore.getState().upsertDistributionList(updatedDL);
		expect(useDistributionListsStore.getState().distributionLists).toStrictEqual([
			dl0,
			dl2,
			updatedDL,
			dl4
		]);
	});

	it('should add new distribution list in the right position', () => {
		const dl0 = generateDistributionList({ displayName: 'position-0' });
		const dl1 = generateDistributionList({ displayName: 'position-1' });
		const dl2 = generateDistributionList({ displayName: 'position-2' });
		const dl4 = generateDistributionList({ displayName: 'position-4' });
		const dl3 = generateDistributionList({ displayName: 'position-3' });
		useDistributionListsStore.getState().setDistributionLists([dl0, dl1, dl2, dl4]);
		useDistributionListsStore.getState().upsertDistributionList(dl3);
		expect(useDistributionListsStore.getState().distributionLists).toStrictEqual([
			dl0,
			dl1,
			dl2,
			dl3,
			dl4
		]);
	});

	it('should merge new distribution list data with existing one on upsert', () => {
		const dl = generateDistributionList();
		const updatedDL: StoredDistributionList = {
			email: dl.email,
			members: generateDistributionListMembersPage([faker.internet.email()]),
			canRequireMembers: true
		};
		useDistributionListsStore.getState().setDistributionLists([dl]);
		useDistributionListsStore.getState().upsertDistributionList(updatedDL);
		expect(useDistributionListsStore.getState().distributionLists).toContainEqual({
			...dl,
			...updatedDL
		});
	});

	it('should sort distribution lists considering both display name and email during evaluation, in lowercase', () => {
		const dl0 = generateDistributionList({ email: 'position-0@test.com', displayName: '' });
		const dl1 = generateDistributionList({ displayName: 'POSITION-1' });
		const dl2 = generateDistributionList({ displayName: 'position-2' });
		const dl4 = generateDistributionList({ email: 'POSITION-4@test.com', displayName: '' });
		const dl3 = generateDistributionList({
			displayName: 'position-3',
			email: 'POSITION-0@should-be-ignored.com'
		});
		useDistributionListsStore.getState().setDistributionLists([dl0, dl1, dl2, dl4]);
		useDistributionListsStore.getState().upsertDistributionList(dl3);
		expect(useDistributionListsStore.getState().distributionLists).toStrictEqual([
			dl0,
			dl1,
			dl2,
			dl3,
			dl4
		]);
	});

	it('should not create list on upsert if no list has been set yet', () => {
		const dl = generateDistributionList();
		useDistributionListsStore.getState().upsertDistributionList(dl);
		expect(useDistributionListsStore.getState().distributionLists).toBeUndefined();
	});
});
