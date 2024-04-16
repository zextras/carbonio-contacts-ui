/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { AddressBookTrashModal } from './address-book-trash';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';

describe('AddressBookTrashModal', () => {
	it('should render a modal with a specific title', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(screen.getByText(`Delete ${addressBook.name}`)).toBeVisible();
	});

	it('should display a close icon', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />);
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
			<AddressBookTrashModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should display a confirmation text', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByText('Do you want to delete the selected address book?', {
				exact: false
			})
		).toBeVisible();
	});

	it('should display a "delete" button, enabled and with a red background', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />);
		const button = screen.getByRole('button', { name: 'Delete' });
		expect(button).toBeEnabled();
		// FIXME
		// expect(button).toHaveStyleRule('backgroundColor', PALETTE.error.regular);
	});

	it('should call the API with the proper parameters if the user clicks on the "delete" button', async () => {
		const apiInterceptor = createAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		await expect(apiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: addressBook.id,
					op: 'trash'
				}
			})
		);
	});

	it('should show a success snackbar after receiving a successful result from the API', async () => {
		createAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(await screen.findByText('Address book moved to trash')).toBeVisible();
	});

	it('should close the modal after a successful result from the API', async () => {
		createAPIInterceptor('FolderAction');
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={onClose} />
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
		createAPIInterceptor('FolderAction', response);
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />
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
		createAPIInterceptor('FolderAction', response);
		const onClose = jest.fn();
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={onClose} />
		);
		const button = screen.getByRole('button', { name: 'Delete' });
		await act(() => user.click(button));
		expect(onClose).not.toHaveBeenCalled();
	});

	it('should call the API to restore the folder position if the user clicks on the "undo" button on the snackbar', async () => {
		createAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			l: faker.string.uuid(),
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />
		);
		await act(() => user.click(screen.getByRole('button', { name: 'Delete' })));
		const button = await screen.findByRole('button', { name: 'Undo' });

		const restoreApiInterceptor = createAPIInterceptor('FolderAction');
		await act(() => user.click(button));
		await expect(restoreApiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: addressBook.id,
					op: 'move',
					l: addressBook.l
				}
			})
		);
	});

	it('should show an error snackbar after receiving a failure result from the restore API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createAPIInterceptor('FolderAction');
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		const { user } = setupTest(
			<AddressBookTrashModal addressBook={addressBook} onClose={jest.fn()} />
		);
		await act(() => user.click(screen.getByRole('button', { name: 'Delete' })));
		const button = await screen.findByRole('button', { name: 'Undo' });

		createAPIInterceptor('FolderAction', response);
		await act(() => user.click(button));
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});
});
