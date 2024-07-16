/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { ErrorSoapBodyResponse, JSNS } from '@zextras/carbonio-shell-ui';

import { AddressBookCreateModal } from './address-book-create';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { isLink, isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { getRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import { makeListItemsVisible, screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { CreateFolderRequest, CreateFolderResponse } from '../../network/api/create-folder';
import { getFoldersArray } from '../../tests/utils';

describe('AddressBookCreateModal', () => {
	it('should display a modal with a specific title', () => {
		setupTest(<AddressBookCreateModal onClose={jest.fn()} />);

		expect(screen.getByText(/create new address book/i)).toBeVisible();
	});

	it('should display a close icon', () => {
		setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should call the onClose callback when the user clicks the close icon', async () => {
		const onClose = jest.fn();
		const { user } = setupTest(<AddressBookCreateModal onClose={onClose} />);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalled();
	});

	it('should display a placeholder in the address book name field', () => {
		setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
		expect(screen.getByRole('textbox', { name: 'Insert address book name' })).toBeVisible();
	});

	it('should display an error message in the label if an address book name already exists with the same name on the same parent', async () => {
		populateFoldersStore();
		const { user } = setupTest(
			<AddressBookCreateModal defaultParentId={FOLDERS.USER_ROOT} onClose={jest.fn()} />
		);
		const input = screen.getByRole('textbox', { name: 'Insert address book name' });
		await act(async () => user.type(input, 'Contacts'));
		expect(screen.getByText('Name already exists in this path')).toBeVisible();
	});

	it('should restore the original label if the given folder name already exists and the user reset the field', async () => {
		populateFoldersStore();
		const { user } = setupTest(
			<AddressBookCreateModal defaultParentId={FOLDERS.USER_ROOT} onClose={jest.fn()} />
		);
		const input = screen.getByRole('textbox', { name: 'Insert address book name' });
		await act(async () => user.type(input, 'Contacts'));
		await waitFor(() => expect(screen.getByText('Name already exists in this path')).toBeVisible());
		await act(async () => user.clear(input));
		expect(screen.getByRole('textbox', { name: 'Insert address book name' })).toBeVisible();
	});

	describe('Parent address book selector', () => {
		it('should display the primary account root', () => {
			populateFoldersStore();
			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			expect(screen.getByTestId(`folder-accordion-root-1`)).toBeVisible();
		});

		// TODO Enable it when the whole list of accounts will be handled
		it.skip('should display the shared accounts roots', () => {
			populateFoldersStore();
			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			getRootsArray().forEach((root) => {
				expect(screen.getByTestId(`folder-accordion-root-${root.id}`)).toBeVisible();
			});
		});

		it('should not display the Trash folder', () => {
			populateFoldersStore();
			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			expect(
				screen.queryByTestId(`folder-accordion-root-${FOLDERS.TRASH}`)
			).not.toBeInTheDocument();
		});

		it('should not display a folder inside the "Trash" folder', () => {
			populateFoldersStore();
			const trashedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && isTrashed({ folder })
			);
			if (!trashedFolder) {
				return;
			}

			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			expect(
				screen.queryByTestId(`folder-accordion-root-${trashedFolder.id}`)
			).not.toBeInTheDocument();
		});

		it('should also display the linked folders', () => {
			populateFoldersStore();
			const linkedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && isLink(folder)
			);
			if (!linkedFolder) {
				return;
			}

			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			makeListItemsVisible();
			expect(screen.queryByTestId(`folder-accordion-item-${linkedFolder.id}`)).toBeVisible();
		});

		it.todo('should select the given parent address book');

		it.todo('should select the primary root if no parent address book is passed as prop');
	});

	describe('Confirm button', () => {
		it('should contain the "Create" label', () => {
			setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
		});

		it('should be disabled if the address book name is not set', async () => {
			const { user } = setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			await act(async () =>
				user.clear(screen.getByRole('textbox', { name: 'Insert address book name' }))
			);
			expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
		});

		it.todo(
			'should be disabled if no parent address book is selected'
			// , () => {
			// const { user } = setupTest(<AddressBookCreateModal onClose={jest.fn()} />);
			// await act(async () =>
			// 	user.clear(screen.getByRole('textbox', { name: 'Insert address book name' }))
			// );
			// expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
			// }
		);

		it('should be enabled if both the address book name and the parent are set', async () => {
			populateFoldersStore();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={FOLDERS.CONTACTS} onClose={jest.fn()} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, faker.string.uuid()));
			expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
		});

		it('should be disabled again, if the address book name is reset', async () => {
			populateFoldersStore();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={FOLDERS.CONTACTS} onClose={jest.fn()} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, faker.string.uuid()));
			await waitFor(() => expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled());
			await act(async () => user.clear(input));
			expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
		});

		it('should be disabled if an address book name already exists with the same name on the same parent', async () => {
			populateFoldersStore();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={FOLDERS.USER_ROOT} onClose={jest.fn()} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, 'Contacts'));
			expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
		});

		it('should call the CreateFolder API with the proper parameters', async () => {
			populateFoldersStore();
			const apiInterceptor = createSoapAPIInterceptor('CreateFolder');
			const parentAddressBookId = FOLDERS.CONTACTS;
			const addressBookName = faker.word.noun(3);
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={parentAddressBookId} onClose={jest.fn()} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, addressBookName));
			await act(async () => user.click(screen.getByRole('button', { name: 'Create' })));
			await expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					folder: expect.objectContaining({
						l: parentAddressBookId,
						name: addressBookName
					})
				})
			);
		});

		it('should display a success snackbar if the API returns success', async () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const addressBookName = faker.word.noun(3);
			createSoapAPIInterceptor<CreateFolderRequest, CreateFolderResponse>('CreateFolder', {
				folder: {
					view: 'contact',
					id: faker.number.int({ min: 100 }).toString(),
					name: addressBookName,
					l: parentAddressBookId,
					activesyncdisabled: true,
					uuid: faker.string.uuid(),
					recursive: false,
					deletable: true
				},
				_jsns: JSNS.mail
			});
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={parentAddressBookId} onClose={jest.fn()} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, addressBookName));
			await act(async () => user.click(screen.getByRole('button', { name: 'Create' })));
			expect(screen.getByText('New address book created')).toBeVisible();
		});

		it('should close the modal if the API returns success', async () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const addressBookName = faker.word.noun(3);
			createSoapAPIInterceptor<CreateFolderRequest, CreateFolderResponse>('CreateFolder', {
				folder: {
					view: 'contact',
					id: faker.number.int({ min: 100 }).toString(),
					name: addressBookName,
					l: parentAddressBookId,
					activesyncdisabled: true,
					uuid: faker.string.uuid(),
					recursive: false,
					deletable: true
				},
				_jsns: JSNS.mail
			});
			const onClose = jest.fn();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={parentAddressBookId} onClose={onClose} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, addressBookName));
			await act(async () => user.click(screen.getByRole('button', { name: 'Create' })));
			expect(onClose).toHaveBeenCalled();
		});

		it('should display an error snackbar if the API returns error', async () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const addressBookName = faker.word.noun(3);
			const response: ErrorSoapBodyResponse = {
				Fault: {
					Code: { Value: faker.string.uuid() },
					Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};
			createSoapAPIInterceptor<CreateFolderRequest, ErrorSoapBodyResponse>(
				'CreateFolder',
				response
			);
			const onClose = jest.fn();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={parentAddressBookId} onClose={onClose} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, addressBookName));
			await act(async () => user.click(screen.getByRole('button', { name: 'Create' })));
			expect(screen.getByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should not close the modal if the API returns error', async () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const addressBookName = faker.word.noun(3);
			const response: ErrorSoapBodyResponse = {
				Fault: {
					Code: { Value: faker.string.uuid() },
					Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
					Reason: { Text: faker.word.sample() }
				}
			};
			createSoapAPIInterceptor<CreateFolderRequest, ErrorSoapBodyResponse>(
				'CreateFolder',
				response
			);
			const onClose = jest.fn();
			const { user } = setupTest(
				<AddressBookCreateModal defaultParentId={parentAddressBookId} onClose={onClose} />
			);
			const input = screen.getByRole('textbox', { name: 'Insert address book name' });
			await act(async () => user.type(input, addressBookName));
			await act(async () => user.click(screen.getByRole('button', { name: 'Create' })));
			expect(onClose).not.toHaveBeenCalled();
		});
	});
});
