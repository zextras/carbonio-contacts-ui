/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { noop } from 'lodash';
import { useParams } from 'react-router-dom';

import { createSoapAPIInterceptor } from '@zextras/carbonio-ui-commons';
import { screen, setupTest } from '@zextras/carbonio-ui-commons';
import { EMPTY_LIST_HINT } from '../../../../../constants/tests';
import { buildContact } from '../../../../../tests/model-builder';
import { Contact, ContactOrGroup } from '../../../../types/contact';
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
	contacts?: ContactOrGroup[];
} = {}): ReturnType<typeof setupTest> {
	return setupTest(
		<ContactsList
			folderId={currentFolderId}
			selected={{}}
			isSelecting={false}
			contacts={contacts}
			toggle={noop}
		/>
	);
}

describe('Contacts list', () => {
	const folderId = '7';
	describe('Contacts', () => {
		beforeEach(() => {
			createSoapAPIInterceptor('Search', {});
		});
		it('should display contacts in list', async () => {
			(useParams as jest.Mock).mockReturnValue({ folderId });
			const contacts: Array<Contact> = [
				buildContact({
					id: '1',
					parent: folderId
				}),
				buildContact({
					id: '2',
					parent: folderId
				})
			];

			setupContactsList({ contacts });

			expect(screen.getByTestId('custom-contact-list-item-1')).toBeVisible();
			expect(screen.getByTestId('custom-contact-list-item-2')).toBeVisible();
		});
	});
	describe('Contact groups', () => {
		beforeEach(() => {
			createSoapAPIInterceptor('Search', {});
		});

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
});
