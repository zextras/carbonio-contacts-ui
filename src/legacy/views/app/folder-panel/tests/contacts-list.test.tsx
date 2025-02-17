/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { noop } from 'lodash';
import { useParams } from 'react-router-dom';

import { createSoapAPIInterceptor } from '../../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_LIST_HINT } from '../../../../../constants/tests';
import { ContactGroup } from '../../../../../model/contact-group';
import { generateStore } from '../../../../tests/generators/store';
import { ContactsList } from '../contacts-list';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: jest.fn()
}));

function setupContactsList({
	currentFolderId = '7',
	contacts = []
}: {
	currentFolderId?: string;
	contacts?: ContactGroup[];
} = {}): ReturnType<typeof setupTest> {
	const store = generateStore();
	return setupTest(
		<ContactsList
			folderId={currentFolderId}
			selected={{}}
			isSelecting={false}
			contacts={contacts}
			toggle={noop}
		/>,
		{ store }
	);
}

describe('Contact groups list', () => {
	beforeEach(() => {
		createSoapAPIInterceptor('Search', {});
	});
	const folderId = '7';
	test('Show a placeholder when the list is empty for folder', async () => {
		(useParams as jest.Mock).mockReturnValue({ folderId: '1111' });
		setupContactsList();
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	test('Show contact groups in list', async () => {
		(useParams as jest.Mock).mockReturnValue({ folderId });
		const contactGroups = [
			{
				id: faker.string.uuid(),
				parent: folderId,
				title: 'hello',
				members: []
			},
			{
				id: faker.string.uuid(),
				parent: folderId,
				title: 'test',
				members: []
			}
		];

		setupContactsList({ contacts: contactGroups });

		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});

	// describe('Pagination', () => {
	// 	it('should load the second page only when bottom element becomes visible', async () => {
	// 		const cnItem1 = createCnItem();
	// 		const cnItems99 = generateNContactGroupsForAPI(FIND_CONTACT_GROUP_LIMIT - 1);
	// 		const first100Items = [cnItem1].concat(...cnItems99);
	// 		const cnItem101 = createCnItem('cgName101');
	// 		const findHandler = registerFindContactGroupsHandler(
	// 			{
	// 				findContactGroupsResponse: createFindContactGroupsResponse(first100Items, true),
	// 				offset: 0
	// 			},
	// 			{
	// 				findContactGroupsResponse: createFindContactGroupsResponse([cnItem101], true),
	// 				offset: 100
	// 			}
	// 		);
	//
	// 		(useParams as jest.Mock).mockReturnValue({ folderId });
	// 		setupTest(<ContactGroupList />);
	//
	// 		expect(await screen.findByText(cnItem1.fileAsStr)).toBeVisible();
	// 		expect(screen.queryByText(cnItem101.fileAsStr)).not.toBeInTheDocument();
	// 		triggerLoadMore();
	// 		await waitFor(() => expect(findHandler).toHaveBeenCalledTimes(2));
	// 		expect(await screen.findByText(cnItem101.fileAsStr)).toBeVisible();
	// 	});
	// });
});
