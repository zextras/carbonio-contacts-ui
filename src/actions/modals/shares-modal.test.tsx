/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { SharesModal } from './shares-modal';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../../constants/api';
import { TESTID_SELECTORS } from '../../constants/tests';
import { GetShareInfoRequest, GetShareInfoResponse } from '../../network/api/get-share-info';

describe('SharesModal', () => {
	it('should render the modal with the specific title', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		expect(screen.getByText('Find Contact Shares')).toBeVisible();
	});

	it('should render a close icon button on the header', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should render a button to add the selected shares', async () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		const button = await screen.findByRole('button', { name: 'Add' });
		expect(button).toBeVisible();
		// expect(button).toBeDisabled();
	});

	it('should render a filter field with a placeholder text and an icon', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		const placeholder = 'Find users';
		const filterInput = screen.getByTestId(TESTID_SELECTORS.findUsersFilterInput);
		const filterInputTextBox = within(filterInput).getByRole('textbox', { name: placeholder });
		expect(filterInputTextBox).toBeVisible();
		const searchInputIcon = within(filterInput).getByTestId(TESTID_SELECTORS.icons.findUsers);
		expect(searchInputIcon).toBeVisible();
	});

	it('should render a hint description', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});
		expect(
			screen.getByText('Select which address book you want to see in contact’s tree')
		).toBeVisible();
	});

	it('should render a list of users that shares some addressbooks', async () => {
		// Create a list of the shares from different users

		const responseShares = times(
			5,
			(index) =>
				({
					folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
					folderPath: `/${faker.word.noun(1)}`,
					folderUuid: faker.string.uuid(),
					granteeType: 'grp',
					ownerEmail: faker.internet.email(),
					ownerId: faker.string.uuid(),
					ownerName: faker.person.fullName(),
					rights: 'r',
					view: 'contact'
				} satisfies GetShareInfoResponse['share'][number])
		);

		createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
			share: responseShares,
			_jsns: NAMESPACES.account
		});

		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});
		expect(screen.getByTestId(TESTID_SELECTORS.sharesUsersListItem)).toBeInTheDocument();

		// Create an API interceptor that returns the list of shares

		// Instantiate the modal

		// Check that the modal is displaying the list, with an item for every user
		expect(await screen.findAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(5);
	});

	it.todo('should render a list of users whose name matching with filter content');

	it.todo('should render a list of all users if user clear the filter content');

	describe('"Add" button', () => {
		it('should be disabled when the modal opens', async () => {
			const onClose = jest.fn();
			setupTest(<SharesModal onClose={onClose} />, {});

			const button = await screen.findByRole('button', { name: 'Add' });
			expect(button).toBeVisible();
			// expect(button).toBeDisabled();
		});

		it.todo('should be enabled if the user select at least one shared addressbook');

		it.todo('should be disabled if there is no selected addressbook');

		it.todo('should call the createMountpoint action if the user click the "add" button');

		it.todo('should close the modal if the createMountpoint action results in success');
	});
});
