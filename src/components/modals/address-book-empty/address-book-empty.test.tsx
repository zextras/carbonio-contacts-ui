/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { AddressBookEmptyModal } from './address-book-empty';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';

describe('AddressBookEmptyModal', () => {
	it('should render a modal with a specific title', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(screen.getByText(`Empty ${addressBook.name}`)).toBeVisible();
	});

	it('should display a close icon', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should close the modal if the user clicks on the close icon', async () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should display a specific confirmation text if the address book is the Trash', () => {
		const addressBook = generateFolder({
			id: FOLDERS.TRASH,
			name: 'Trash',
			absFolderPath: '/Trash',
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByText('Do you want to empty the trash?', {
				exact: false
			})
		).toBeVisible();
	});

	it("should display a specific confirmation text if the address book isn't the Trash", () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByText('Do you want to empty the selected address book?', {
				exact: false
			})
		).toBeVisible();
	});

	it('should display a "empty" button, enabled and with a red background', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />);
		const button = screen.getByRole('button', { name: 'Empty' });
		expect(button).toBeEnabled();
		// FIXME
		// expect(button).toHaveStyleRule('backgroundColor', PALETTE.error.regular);
	});

	it('should call the API with the proper parameters if the user clicks on the "empty" button', async () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			id: FOLDERS.TRASH,
			name: 'Trash',
			absFolderPath: '/Trash',
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		await expect(apiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: addressBook.id,
					op: 'empty',
					recursive: true,
					type: 'contacts'
				}
			})
		);
	});

	it('should show a success snackbar after receiving a successful result from the API for the Trash address book', async () => {
		createSoapAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			id: FOLDERS.TRASH,
			name: 'Trash',
			absFolderPath: '/Trash',
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		expect(await screen.findByText('Trash folder emptied successfully')).toBeVisible();
	});

	it('should show a success snackbar after receiving a successful result from the API for a non-Trash address book', async () => {
		createSoapAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		expect(await screen.findByText('Address book emptied successfully')).toBeVisible();
	});

	it('should close the modal after a successful result from the API', async () => {
		createSoapAPIInterceptor('FolderAction');
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('FolderAction', response);
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it("shouldn't close the modal after a failure result from the API", async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('FolderAction', response);
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookEmptyModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRole('button', { name: 'Empty' });
		await act(() => user.click(button));
		expect(onClose).not.toHaveBeenCalled();
	});
});
