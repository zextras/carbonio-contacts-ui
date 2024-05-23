/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';
import { times } from 'lodash';

import { ContactMoveModal } from './contact-move';
import { isTrashed } from '../../carbonio-ui-commons/helpers/folders';
import { getFoldersArray, getRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import {
	makeListItemsVisible,
	screen,
	setupTest,
	within
} from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { buildContact } from '../../tests/model-builder';

describe('ContactMoveModal', () => {
	it('should display a modal with a specific title for a single contact', () => {
		const contact = buildContact();
		setupTest(<ContactMoveModal contacts={[contact]} onMove={jest.fn()} onClose={jest.fn()} />);
		expect(
			screen.getByText(`Move ${contact.firstName} ${contact.lastName}'s contact`)
		).toBeVisible();
	});

	it('should display a modal with a specific title for multiple contacts', () => {
		const contacts = times(10, () => buildContact());
		setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
		expect(screen.getByText(`Move ${contacts.length} contacts`)).toBeVisible();
	});

	it('should display a close icon', () => {
		const contacts = [buildContact()];
		setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should call the onClose callback when the user clicks the close icon', async () => {
		const contacts = [buildContact()];
		const onClose = jest.fn();
		const { user } = setupTest(
			<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={onClose} />
		);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalled();
	});

	describe('Parent address book selector', () => {
		it('should display the primary account root', () => {
			populateFoldersStore();
			const contacts = [buildContact()];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			expect(screen.getByTestId(`folder-accordion-root-1`)).toBeVisible();
		});

		it('should display the shared accounts roots', () => {
			populateFoldersStore();
			const contacts = [buildContact()];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			getRootsArray().forEach((root) => {
				expect(screen.getByTestId(`folder-accordion-root-${root.id}`)).toBeVisible();
			});
		});

		it('should not display the Trash folder', () => {
			populateFoldersStore();
			const contacts = [buildContact()];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			expect(
				screen.queryByTestId(`folder-accordion-root-${FOLDERS.TRASH}`)
			).not.toBeInTheDocument();
		});

		it('should not display a folder inside the "Trash" folder', () => {
			populateFoldersStore();
			const contacts = [buildContact()];

			const trashedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && isTrashed({ folder })
			);
			if (!trashedFolder) {
				return;
			}

			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			expect(
				screen.queryByTestId(`folder-accordion-root-${trashedFolder.id}`)
			).not.toBeInTheDocument();
		});

		it('should display the linked folders', () => {
			populateFoldersStore();
			const contacts = [buildContact()];

			const linkedFolder = getFoldersArray().find(
				(folder) => folder.view === 'contact' && folder.isLink
			);
			if (!linkedFolder) {
				return;
			}

			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			makeListItemsVisible();
			expect(screen.getByTestId(`folder-accordion-item-${linkedFolder.id}`)).toBeVisible();
		});

		it('should not display the current parent address book, if only one contact is passed as parameter', () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const contacts = [buildContact({ parent: parentAddressBookId })];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			makeListItemsVisible();
			expect(
				screen.queryByTestId(`folder-accordion-item-${parentAddressBookId}`)
			).not.toBeInTheDocument();
		});

		it('should not display the current parent address book, if multiple contacts of the same address book are passed as parameter', () => {
			populateFoldersStore();
			const parentAddressBookId = FOLDERS.CONTACTS;
			const contacts = times(10, () => buildContact({ parent: parentAddressBookId }));
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			makeListItemsVisible();
			expect(
				screen.queryByTestId(`folder-accordion-item-${parentAddressBookId}`)
			).not.toBeInTheDocument();
		});

		it('should display the current parent address books, if multiple contacts of different address books are passed as parameter', () => {
			populateFoldersStore();
			const contacts = [
				buildContact({ parent: FOLDERS.CONTACTS }),
				buildContact({ parent: FOLDERS.AUTO_CONTACTS })
			];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			makeListItemsVisible();
			contacts.forEach((contact) =>
				expect(screen.getByTestId(`folder-accordion-item-${contact.parent}`)).toBeVisible()
			);
		});

		it.todo('should select the given parent address book');

		it.todo('should select the primary root if no parent address book is passed as prop');
	});

	describe('Confirm button', () => {
		it('should contain the "Move" label', () => {
			populateFoldersStore();
			const contacts = [buildContact()];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			expect(screen.getByRole('button', { name: 'Move' })).toBeVisible();
		});

		it('should be initially disabled ', () => {
			populateFoldersStore();
			const contacts = [buildContact()];
			setupTest(<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />);
			expect(screen.getByRole('button', { name: 'Move' })).toBeDisabled();
		});

		// FIXME find why the accordion item is not clickable
		it.skip('should be enabled if the user selects a parent folder', async () => {
			populateFoldersStore();
			const contacts = [buildContact({ parent: FOLDERS.AUTO_CONTACTS })];
			const { user } = setupTest(
				<ContactMoveModal contacts={contacts} onMove={jest.fn()} onClose={jest.fn()} />
			);
			makeListItemsVisible();
			const newParentListItem = screen.getByTestId('folder-accordion-item-7');
			await act(async () => user.click(newParentListItem));
			expect(screen.getByRole('button', { name: 'Move' })).toBeEnabled();
		});

		// FIXME find why the accordion item is not clickable
		it.skip('should call the onMove callback if the user clicks on it', async () => {
			populateFoldersStore();
			const contacts = [buildContact({ parent: FOLDERS.AUTO_CONTACTS })];

			const destinationFolder = FOLDERS.CONTACTS;
			const onMove = jest.fn();
			const { user } = setupTest(
				<ContactMoveModal contacts={contacts} onMove={onMove} onClose={jest.fn()} />
			);
			makeListItemsVisible();
			const newParentListItem = within(
				screen.getByTestId(`folder-accordion-item-${destinationFolder}`)
			).getByText('Contacts');
			await act(async () => user.click(newParentListItem));
			await act(async () => user.click(screen.getByRole('button', { name: 'Move' })));
			expect(onMove).toHaveBeenCalledWith(destinationFolder);
		});
	});
});
