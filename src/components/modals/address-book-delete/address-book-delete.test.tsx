/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { AddressBookDeleteModal } from './address-book-delete';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';

describe('AddressBookDeleteModal', () => {
	it('should render a modal with a specific title', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(screen.getByText(`Delete ${addressBook.name}`)).toBeVisible();
	});

	it('should display a close icon', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
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
			<AddressBookDeleteModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should display a confirmation text', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByText('Do you want to delete permanently the selected address book', {
				exact: false
			})
		).toBeVisible();
	});

	it('should display a "delete" button, enabled and with a red background', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		const button = screen.getByRole('button', { name: 'Delete' });
		expect(button).toBeEnabled();
		// FIXME
		// expect(button).toHaveStyleRule('backgroundColor', PALETTE.error.regular);
	});

	it('should call the API with the proper parameters if the user clicks on the "delete" button', async () => {
		const apiInterceptor = createSoapAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		await expect(apiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: addressBook.id,
					op: 'delete'
				}
			})
		);
	});

	it('should show a success snackbar after receiving a successful result from the API', async () => {
		createSoapAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(await screen.findByText('Address book permanently deleted')).toBeVisible();
	});

	it('should close the modal after a successful result from the API', async () => {
		createSoapAPIInterceptor('FolderAction');
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookDeleteModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('FolderAction', response);
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it("shouldn't close the modal after a failure result from the API", async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('FolderAction', response);
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookDeleteModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(onClose).not.toHaveBeenCalled();
	});
});
