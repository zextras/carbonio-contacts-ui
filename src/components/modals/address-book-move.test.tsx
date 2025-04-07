/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';

import { AddressBookMoveModal } from './address-book-move';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { isLink, isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { getRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import { getMocksContext } from '../../carbonio-ui-commons/test/mocks/utils/mocks-context';
import {
	makeListItemsVisible,
	screen,
	setupTest,
	within
} from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { getFoldersArray } from '../../tests/utils';

describe('AddressBookMoveModal', () => {
	const mocksContext = getMocksContext();
	const primaryAccountEmail = mocksContext.identities.primary.identity.email;

	it('should display a modal with a specific title', () => {
		const addressBook = getFoldersArray().find(
			(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
		);
		if (!addressBook) {
			return;
		}

		setupTest(
			<AddressBookMoveModal addressBookId={addressBook.id} onMove={jest.fn()} onClose={jest.fn()} />
		);
		expect(screen.getByText(`Move ${addressBook.name}`)).toBeVisible();
	});

	it('should display a close icon', () => {
		const addressBook = getFoldersArray().find(
			(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
		);
		if (!addressBook) {
			return;
		}
		setupTest(
			<AddressBookMoveModal addressBookId={addressBook.id} onMove={jest.fn()} onClose={jest.fn()} />
		);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should call the onClose callback when the user clicks the close icon', async () => {
		const addressBook = getFoldersArray().find(
			(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
		);
		if (!addressBook) {
			return;
		}
		const onClose = jest.fn();
		const { user } = setupTest(
			<AddressBookMoveModal addressBookId={addressBook.id} onMove={jest.fn()} onClose={onClose} />
		);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalled();
	});

	describe('Parent address book selector', () => {
		it('should display the primary account root', () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBook.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			expect(screen.getByTestId(`folder-accordion-root-1`)).toBeVisible();
		});

		it('should display the shared accounts roots', () => {
			populateFoldersStore({ view: 'contact' });
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBook.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);

			getRootsArray().forEach((root) => {
				expect(screen.getByTestId(`folder-accordion-root-${root.id}`)).toBeVisible();
			});
		});

		it('should not display the Trash folder', () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBook.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			expect(
				screen.queryByTestId(`folder-accordion-root-${FOLDERS.TRASH}`)
			).not.toBeInTheDocument();
		});

		it('should not display a folder inside the "Trash" folder', () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const trashedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && isTrashed({ folder })
			);
			if (!trashedFolder) {
				return;
			}

			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBook.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			expect(
				screen.queryByTestId(`folder-accordion-root-${trashedFolder.id}`)
			).not.toBeInTheDocument();
		});

		it('should display the linked folders', () => {
			populateFoldersStore();
			const addressBook = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBook) {
				return;
			}
			const linkedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && isLink(folder)
			);
			if (!linkedFolder) {
				throw new Error('Not linked folder available for the test');
			}

			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBook.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			makeListItemsVisible();
			expect(screen.getByTestId(`folder-accordion-item-${linkedFolder.id}`)).toBeVisible();
		});

		it('should not display the current parent folders', () => {
			populateFoldersStore();
			const addressBookToMove = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBookToMove) {
				return;
			}

			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBookToMove.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			makeListItemsVisible();
			expect(
				screen.queryByTestId(`folder-accordion-item-${FOLDERS.CONTACTS}`)
			).not.toBeInTheDocument();
		});

		it.todo('should select the given parent address book');

		it.todo('should select the primary root if no parent address book is passed as prop');
	});

	describe('Confirm button', () => {
		it('should contain the "Move" label', () => {
			const addressBookToMove = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBookToMove) {
				return;
			}
			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBookToMove.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			expect(screen.getByRole('button', { name: 'Move' })).toBeVisible();
		});

		it('should be initially disabled ', () => {
			populateFoldersStore();
			const addressBookToMove = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBookToMove) {
				return;
			}
			setupTest(
				<AddressBookMoveModal
					addressBookId={addressBookToMove.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
		});

		it('should be enabled if the user selects a parent folder', async () => {
			populateFoldersStore();
			const addressBookToMove = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.l === FOLDERS.CONTACTS
			);
			if (!addressBookToMove) {
				return;
			}
			const { user } = setupTest(
				<AddressBookMoveModal
					addressBookId={addressBookToMove.id}
					onMove={jest.fn()}
					onClose={jest.fn()}
				/>
			);
			makeListItemsVisible();
			const newParentListItem = within(screen.getByTestId('folder-accordion-root-1')).getByText(
				primaryAccountEmail
			);
			await act(async () => user.click(newParentListItem));
			expect(screen.getByRole('button', { name: 'Move' })).toBeEnabled();
		});

		it('should call the onMove callback if the user clicks on it', async () => {
			populateFoldersStore();
			const addressBookToMove = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.parent === FOLDERS.CONTACTS
			);
			if (!addressBookToMove) {
				return;
			}
			const destinationFolder = '1';
			const onMove = jest.fn();
			const { user } = setupTest(
				<AddressBookMoveModal
					addressBookId={addressBookToMove.id}
					onMove={onMove}
					onClose={jest.fn()}
				/>
			);
			makeListItemsVisible();
			const newParentListItem = within(
				screen.getByTestId(`folder-accordion-root-${destinationFolder}`)
			).getByText(primaryAccountEmail);
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(screen.getByRole('button', { name: 'Move' })));
			expect(onMove).toHaveBeenCalledWith(destinationFolder);
		});
	});
});
