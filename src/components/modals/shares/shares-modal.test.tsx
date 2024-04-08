/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { SharesModal } from './shares-modal';
import { createAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import {
	makeListItemsVisible,
	screen,
	setupTest,
	within
} from '../../../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../../../constants/api';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { CreateMountpointsRequest } from '../../../network/api/create-mountpoints';
import { GetShareInfoRequest, GetShareInfoResponse } from '../../../network/api/get-share-info';

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

	it('should render an error snackbar if the GetShareInfo API will return an error', async () => {
		createAPIInterceptor<GetShareInfoRequest, ErrorSoapBodyResponse>('GetShareInfo', {
			Fault: {
				Detail: { Error: { Code: 'error-code', Detail: 'error-detail' } },
				Reason: { Text: 'everything is broken' }
			}
		});

		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
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
					ownerEmail: `user-${index}@${faker.internet.domainName()}`,
					ownerId: faker.string.uuid(),
					ownerName: `user-${index}`,
					rights: 'r',
					view: 'contact'
				}) satisfies GetShareInfoResponse['share'][number]
		);

		// Create an API interceptor that returns the list of shares
		createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
			share: responseShares,
			_jsns: NAMESPACES.account
		});

		// Instantiate the modal
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		await act(async () => Promise.resolve());
		makeListItemsVisible();

		// Check that the modal is displaying the list, with an item for every user
		expect(await screen.findAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(5);
		responseShares.forEach((share) => {
			expect(screen.getByText(`${share.ownerName}'s shared address books`)).toBeVisible();
		});
	});

	it.todo('should render a list of users whose name matching with filter content');

	it.todo('should render a list of all users if user clear the filter content');

	describe('"Add" button', () => {
		it('should be disabled when the modal opens', async () => {
			const onClose = jest.fn();
			setupTest(<SharesModal onClose={onClose} />, {});

			const button = await screen.findByRole('button', { name: 'Add' });
			expect(button).toBeDisabled();
		});

		it('should be enabled if the user select at least one shared addressbook', async () => {
			// Create a list of the shares from different users
			const responseShares = times(
				5,
				(index) =>
					({
						folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
						folderPath: `/${faker.word.noun(1)}`,
						folderUuid: faker.string.uuid(),
						granteeType: 'grp',
						ownerEmail: `user-${index}@${faker.internet.domainName()}`,
						ownerId: faker.string.uuid(),
						ownerName: `user-${index}`,
						rights: 'r',
						view: 'contact'
					}) satisfies GetShareInfoResponse['share'][number]
			);

			// Create an API interceptor that returns the list of shares
			createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
				share: responseShares,
				_jsns: NAMESPACES.account
			});

			// Instantiate the modal
			const onClose = jest.fn();
			const { user } = setupTest(<SharesModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			// Check that the modal is displaying the list, with an item for every user
			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			expect(await screen.findByRole('button', { name: 'Add' })).toBeEnabled();
		});

		it('should be disabled if the user deselect all the addressbooks', async () => {
			// Create a list of the shares from different users
			const responseShares = times(
				5,
				(index) =>
					({
						folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
						folderPath: `/${faker.word.noun(1)}`,
						folderUuid: faker.string.uuid(),
						granteeType: 'grp',
						ownerEmail: `user-${index}@${faker.internet.domainName()}`,
						ownerId: faker.string.uuid(),
						ownerName: `user-${index}`,
						rights: 'r',
						view: 'contact'
					}) satisfies GetShareInfoResponse['share'][number]
			);

			// Create an API interceptor that returns the list of shares
			createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
				share: responseShares,
				_jsns: NAMESPACES.account
			});

			// Instantiate the modal
			const onClose = jest.fn();
			const { user } = setupTest(<SharesModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			// Check that the modal is displaying the list, with an item for every user
			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);

			// Select a share
			await act(async () => user.click(checkboxes[0]));

			// Deselect the selected share
			await act(async () => user.click(checkboxes[0]));
			act(() => jest.advanceTimersByTime(1000));

			expect(await screen.findByRole('button', { name: 'Add' })).toBeDisabled();
		});

		it('should call the createMountpoint API if the user click the "add" button', async () => {
			// Create a list of the shares from different users
			const responseShares = times(
				5,
				(index) =>
					({
						folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
						folderPath: `/${faker.word.noun(1)}`,
						folderUuid: faker.string.uuid(),
						granteeType: 'grp',
						ownerEmail: `user-${index}@${faker.internet.domainName()}`,
						ownerId: faker.string.uuid(),
						ownerName: `user-${index}`,
						rights: 'r',
						view: 'contact'
					}) satisfies GetShareInfoResponse['share'][number]
			);

			// Create an API interceptor that returns the list of shares
			createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
				share: responseShares,
				_jsns: NAMESPACES.account
			});

			const createMountpointsInterceptor = createAPIInterceptor<CreateMountpointsRequest, never>(
				'Batch'
			);

			// Instantiate the modal
			const { user } = setupTest(<SharesModal onClose={jest.fn()} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			await act(async () => user.click(screen.getByRole('button', { name: 'Add' })));

			const batchRequest = await createMountpointsInterceptor;
			expect(batchRequest.CreateMountpointRequest).toBeDefined();
		});

		it('should close the modal if the createMountpoint action results in success', async () => {
			// Create a list of the shares from different users
			const responseShares = times(
				5,
				(index) =>
					({
						folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
						folderPath: `/${faker.word.noun(1)}`,
						folderUuid: faker.string.uuid(),
						granteeType: 'grp',
						ownerEmail: `user-${index}@${faker.internet.domainName()}`,
						ownerId: faker.string.uuid(),
						ownerName: `user-${index}`,
						rights: 'r',
						view: 'contact'
					}) satisfies GetShareInfoResponse['share'][number]
			);

			// Create an API interceptor that returns the list of shares
			createAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
				share: responseShares,
				_jsns: NAMESPACES.account
			});

			createAPIInterceptor<CreateMountpointsRequest, never>('Batch');

			const onClose = jest.fn();
			// Instantiate the modal
			const { user } = setupTest(<SharesModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			await act(async () => user.click(screen.getByRole('button', { name: 'Add' })));

			expect(onClose).toHaveBeenCalled();
		});

		it.todo('should display a success snackbar if the API returns a successful result');

		it.todo('should display an error snackbar if the API returns an error');
	});
});
