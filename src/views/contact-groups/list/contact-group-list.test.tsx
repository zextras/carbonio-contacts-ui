/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';
import { useParams } from 'react-router-dom';

import { ContactGroupList } from './contact-groups-list';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest, triggerLoadMore } from '../../../carbonio-ui-commons/test/test-setup';
import { FIND_CONTACT_GROUP_LIMIT } from '../../../constants';
import { EMPTY_LIST_HINT } from '../../../constants/tests';
import { CnItem } from '../../../network/api/types';
import { useContactGroupStore } from '../../../store/contact-groups';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../../../tests/utils';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: jest.fn()
}));

function generateNContactGroups(n: number): Array<CnItem> {
	return [...Array(n)].map((value, index) => createCnItem(`name-${index}`, [], index.toString()));
}

describe('Contact groups list', () => {
	beforeEach(() => {
		createSoapAPIInterceptor('Search', {});
	});
	const folderId = '7';
	test('Show a placeholder when the list is empty for folder', async () => {
		(useParams as jest.Mock).mockReturnValue({ folderId: '1111' });
		setupTest(<ContactGroupList />);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	it('should not display items of different folders', async () => {
		const folder1Id = '1';
		const folder2Id = '2';
		const contactGroupsFolder1 = [
			{
				id: faker.string.uuid(),
				folderId: folder1Id,
				title: 'hello I am in folder 1',
				members: []
			}
		];
		const contactGroupsFolder2 = [
			{
				id: faker.string.uuid(),
				folderId: folder2Id,
				title: 'hello I am in folder 2',
				members: []
			}
		];
		useContactGroupStore.setState({
			contactGroups: [...contactGroupsFolder1, ...contactGroupsFolder2]
		});

		(useParams as jest.Mock).mockReturnValue({ folderId: folder2Id });
		setupTest(<ContactGroupList />);

		expect(await screen.findByText('hello I am in folder 2')).toBeVisible();
		expect(screen.queryByText('hello I am in folder 1')).not.toBeInTheDocument();
	});

	test('Show list items if the list is not empty', async () => {
		(useParams as jest.Mock).mockReturnValue({ folderId });
		const contactGroups = [
			{
				id: faker.string.uuid(),
				folderId,
				title: 'hello',
				members: []
			},
			{
				id: faker.string.uuid(),
				folderId,
				title: 'test',
				members: []
			}
		];
		useContactGroupStore.setState({ contactGroups });
		setupTest(<ContactGroupList />);
		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});

	describe('Pagination', () => {
		it('should load the second page only when bottom element becomes visible', async () => {
			const cnItem1 = createCnItem();
			const cnItems99 = generateNContactGroups(FIND_CONTACT_GROUP_LIMIT - 1);
			const first100Items = [cnItem1].concat(...cnItems99);
			const cnItem101 = createCnItem('cgName101');
			const findHandler = registerFindContactGroupsHandler(
				{
					findContactGroupsResponse: createFindContactGroupsResponse(first100Items, true),
					offset: 0
				},
				{
					findContactGroupsResponse: createFindContactGroupsResponse([cnItem101], true),
					offset: 100
				}
			);

			(useParams as jest.Mock).mockReturnValue({ folderId });
			setupTest(<ContactGroupList />);

			expect(await screen.findByText(cnItem1.fileAsStr)).toBeVisible();
			expect(screen.queryByText(cnItem101.fileAsStr)).not.toBeInTheDocument();
			triggerLoadMore();
			await waitFor(() => expect(findHandler).toHaveBeenCalledTimes(2));
			expect(await screen.findByText(cnItem101.fileAsStr)).toBeVisible();
		});
	});
});
