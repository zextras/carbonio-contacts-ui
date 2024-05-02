/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { SharedAddressBooksAddModal } from './shared-address-books-add-modal';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
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

const buildSharesInfo = ({
	ownersCount = 5,
	owners
}: {
	ownersCount?: number;
	owners?: Array<{ name: string; email: string; id: string }>;
} = {}): GetShareInfoResponse['share'] =>
	times(owners ? owners.length : ownersCount, (index) => ({
		folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
		folderPath: `/${faker.word.noun(1)}`,
		folderUuid: faker.string.uuid(),
		granteeType: 'grp',
		ownerEmail: owners ? owners[index].email : `user-${index}@${faker.internet.domainName()}`,
		ownerId: owners ? owners[index].id : faker.string.uuid(),
		ownerName: owners ? owners[index].name : `user-${index}`,
		rights: 'r',
		view: 'contact'
	}));

const registerDefaultGetShareInfoHandler = (sharesInfo: GetShareInfoResponse['share']): void => {
	// Create an API interceptor that returns the list of shares
	createSoapAPIInterceptor<GetShareInfoRequest, GetShareInfoResponse>('GetShareInfo', {
		share: sharesInfo,
		_jsns: NAMESPACES.account
	});
};

describe('SharesModal', () => {
	it('should render the modal with the specific title', async () => {
		registerDefaultGetShareInfoHandler(buildSharesInfo());
		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		expect(screen.getByText('Find Contact Shares')).toBeVisible();
		await act(async () => Promise.resolve());
	});

	it('should render a close icon button on the header', async () => {
		registerDefaultGetShareInfoHandler(buildSharesInfo());
		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();

		await act(async () => Promise.resolve());
	});

	it('should render a filter field with a placeholder text and an icon', async () => {
		registerDefaultGetShareInfoHandler(buildSharesInfo());
		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		const placeholder = 'Find users';
		const filterInput = screen.getByTestId(TESTID_SELECTORS.findUsersFilterInput);
		const filterInputTextBox = within(filterInput).getByRole('textbox', { name: placeholder });
		expect(filterInputTextBox).toBeVisible();
		const searchInputIcon = within(filterInput).getByTestId(TESTID_SELECTORS.icons.findUsers);
		expect(searchInputIcon).toBeVisible();
		await act(async () => Promise.resolve());
	});

	it('should render a hint description', async () => {
		registerDefaultGetShareInfoHandler(buildSharesInfo());
		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});
		expect(
			screen.getByText('Select which address book you want to see in contact’s tree')
		).toBeVisible();
		await act(async () => Promise.resolve());
	});

	it('should render a list of users that shares some addressbooks', async () => {
		const responseShares = buildSharesInfo();
		registerDefaultGetShareInfoHandler(responseShares);

		// Instantiate the modal
		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		await act(async () => Promise.resolve());
		makeListItemsVisible();

		// Check that the modal is displaying the list, with an item for every user
		expect(screen.getAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(5);
		responseShares.forEach((share) => {
			expect(screen.getByText(`${share.ownerName}'s shared address books`)).toBeVisible();
		});
		await act(async () => Promise.resolve());
	});

	it('should render an error snackbar if the GetShareInfo API will return an error', async () => {
		createSoapAPIInterceptor<GetShareInfoRequest, ErrorSoapBodyResponse>('GetShareInfo', {
			Fault: {
				Detail: { Error: { Code: 'error-code', Detail: 'error-detail' } },
				Reason: { Text: 'everything is broken!' }
			}
		});

		const onClose = jest.fn();
		setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
		await waitForElementToBeRemoved(screen.queryByText(/something went wrong/i), {
			timeout: 10000
		});
	});

	it('should render a list of users whose name matching with filter content', async () => {
		const owners = [
			{
				id: faker.string.uuid(),
				name: 'AAA',
				email: 'aaa@domain.net'
			},
			{
				id: faker.string.uuid(),
				name: 'BBB',
				email: 'bbb@domain.net'
			},
			{
				id: faker.string.uuid(),
				name: 'AAACCC',
				email: 'aaaccc@domain.net'
			}
		];
		const responseShares = buildSharesInfo({ owners });
		registerDefaultGetShareInfoHandler(responseShares);

		// Instantiate the modal
		const onClose = jest.fn();
		const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		await act(async () => Promise.resolve());
		makeListItemsVisible();

		const filterInputTextBox = screen.getByRole('textbox', { name: 'Find users' });
		await act(async () => {
			await user.type(filterInputTextBox, 'AA');
		});

		expect(screen.getAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(2);
		expect(screen.getByText(`AAA's shared address books`)).toBeVisible();
		expect(screen.getByText(`AAACCC's shared address books`)).toBeVisible();
		await act(async () => Promise.resolve());
	});

	it('should render a list of all users if user clear the filter content', async () => {
		const owners = [
			{
				id: faker.string.uuid(),
				name: 'AAA',
				email: 'aaa@domain.net'
			},
			{
				id: faker.string.uuid(),
				name: 'BBB',
				email: 'bbb@domain.net'
			},
			{
				id: faker.string.uuid(),
				name: 'AAACCC',
				email: 'aaaccc@domain.net'
			}
		];
		const responseShares = buildSharesInfo({ owners });
		registerDefaultGetShareInfoHandler(responseShares);

		// Instantiate the modal
		const onClose = jest.fn();
		const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

		await act(async () => Promise.resolve());
		makeListItemsVisible();

		const filterInputTextBox = screen.getByRole('textbox', { name: 'Find users' });
		await act(async () => {
			await user.type(filterInputTextBox, 'B');
		});
		await waitFor(() =>
			expect(screen.getAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(1)
		);

		await act(async () => Promise.resolve());
	});

	describe('"Add" button', () => {
		it('should render a button to add the selected shares', async () => {
			registerDefaultGetShareInfoHandler(buildSharesInfo());
			const onClose = jest.fn();
			setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

			const button = await screen.findByRole('button', { name: 'Add' });
			expect(button).toBeVisible();
		});

		it('should be disabled when the modal opens', async () => {
			registerDefaultGetShareInfoHandler(buildSharesInfo());
			const onClose = jest.fn();
			setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

			const button = await screen.findByRole('button', { name: 'Add' });
			expect(button).toBeDisabled();
		});

		it('should be enabled if the user select at least one shared addressbook', async () => {
			const responseShares = buildSharesInfo();
			registerDefaultGetShareInfoHandler(responseShares);

			// Instantiate the modal
			const onClose = jest.fn();
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

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
			const responseShares = buildSharesInfo();
			registerDefaultGetShareInfoHandler(responseShares);

			// Instantiate the modal
			const onClose = jest.fn();
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

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
			registerDefaultGetShareInfoHandler(buildSharesInfo());
			const createMountpointsInterceptor = createSoapAPIInterceptor<
				CreateMountpointsRequest,
				never
			>('Batch');

			// Instantiate the modal
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={jest.fn()} />, {});

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
			const responseShares = buildSharesInfo();
			registerDefaultGetShareInfoHandler(responseShares);

			createSoapAPIInterceptor<CreateMountpointsRequest, never>('Batch');

			const onClose = jest.fn();
			// Instantiate the modal
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			await act(async () => user.click(screen.getByRole('button', { name: 'Add' })));

			expect(onClose).toHaveBeenCalled();
		});

		it('should display a success snackbar if the API returns a successful result', async () => {
			const responseShares = buildSharesInfo();
			registerDefaultGetShareInfoHandler(responseShares);

			createSoapAPIInterceptor<CreateMountpointsRequest, never>('Batch');

			const onClose = jest.fn();
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			await act(async () => user.click(screen.getByRole('button', { name: 'Add' })));

			expect(await screen.findByText(/Shared added successfully/i)).toBeVisible();
			await waitForElementToBeRemoved(screen.queryByText(/Shared added successfully/i), {
				timeout: 10000
			});
		});

		it('should display an error snackbar if the API returns an error', async () => {
			const responseShares = buildSharesInfo();
			registerDefaultGetShareInfoHandler(responseShares);

			createSoapAPIInterceptor<CreateMountpointsRequest, ErrorSoapBodyResponse>('Batch', {
				Fault: {
					Detail: { Error: { Code: 'error-code', Detail: 'error-detail' } },
					Reason: { Text: 'everything is broken!' }
				}
			});

			const onClose = jest.fn();
			const { user } = setupTest(<SharedAddressBooksAddModal onClose={onClose} />, {});

			await act(async () => Promise.resolve());
			makeListItemsVisible();
			makeListItemsVisible();
			act(() => jest.advanceTimersByTime(1000));

			const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
			await act(async () => user.click(checkboxes[0]));
			await act(async () => user.click(screen.getByRole('button', { name: 'Add' })));

			expect(await screen.findByText(/something went wrong/i)).toBeVisible();
			await waitForElementToBeRemoved(screen.queryByText(/something went wrong/i), {
				timeout: 10000
			});
		});
	});
});
