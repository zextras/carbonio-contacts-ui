/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { FolderTreeSelector, FolderTreeSelectorProps } from './folder-tree-selector';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import {
	getFolderOwnerAccountName,
	isRoot,
	isTrash,
	isTrashed
} from '../../carbonio-ui-commons/helpers/folders';
import {
	getFolder,
	getFoldersArray,
	getFoldersArrayByRoot,
	getRootsMap
} from '../../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { populateFoldersStore } from '../../carbonio-ui-commons/test/mocks/store/folders';
import { makeListItemsVisible, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { isEmailedContacts } from '../../helpers/folders';

describe('Folder selector', () => {
	test('The selector is visible', () => {
		populateFoldersStore();
		const props: FolderTreeSelectorProps = {
			allowFolderCreation: false,
			allowRootSelection: false,
			showSharedAccounts: false,
			showTrashFolder: false,
			selectedFolderId: FOLDERS.CONTACTS,
			onFolderSelected: jest.fn()
		};
		setupTest(<FolderTreeSelector {...props} />);

		expect(screen.getByTestId('folder-name-filter')).toBeVisible();
	});

	/**
	 * Tests that the folder selector is rendering each folder for each root
	 */
	describe('Folders accordion items', () => {
		populateFoldersStore();
		const rootIds = Object.keys(getRootsMap());
		test.each(rootIds)(
			'Exists a folder accordion item for each folder of the root %s',
			(rootId) => {
				populateFoldersStore();
				const folders = getFoldersArrayByRoot(rootId);
				const props: FolderTreeSelectorProps = {
					allowFolderCreation: false,
					allowRootSelection: false,
					showSharedAccounts: true,
					showTrashFolder: true,
					selectedFolderId: FOLDERS.CONTACTS,
					onFolderSelected: jest.fn()
				};
				setupTest(<FolderTreeSelector {...props} />);
				makeListItemsVisible();
				folders.forEach((folder) => {
					expect(screen.getByTestId(`folder-accordion-item-${folder.id}`)).toBeVisible();
				});
			}
		);
	});

	describe('Roots accordion items', () => {
		populateFoldersStore();
		const rootIds = Object.keys(getRootsMap());
		test.each(rootIds)('There is a folder accordion item for the root %s', (rootId) => {
			populateFoldersStore();
			const roots = getRootsMap();
			const ownerAccountName = getFolderOwnerAccountName(rootId, roots);

			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: true,
				showTrashFolder: false,
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			expect(screen.queryByText(ownerAccountName)).toBeVisible();
		});
	});

	describe('Filter', () => {
		test('if the user type "Contacts" in the filter only the "Emailed Contacts" folder is displayed', async () => {
			populateFoldersStore({ view: FOLDER_VIEW.contact });
			const foldersCount = getFoldersArray().reduce<number>(
				(result, folder) => (isEmailedContacts(folder.id) ? result + 1 : result),
				0
			);
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: true,
				showTrashFolder: false,
				selectedFolderId: FOLDERS.CONTACTS,
				onFolderSelected: jest.fn()
			};
			const folderName = 'Emailed contacts';
			const { user } = setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			const filterInput = screen.getByTestId('folder-name-filter');
			await user.type(filterInput, folderName);

			const accordionItems = await screen.findAllByTestId(/^folder-accordion-item-/);
			expect(accordionItems.length).toBe(foldersCount);
			expect(screen.getByTestId(`folder-accordion-item-${FOLDERS.AUTO_CONTACTS}`)).toBeVisible();
		});

		test('if the user type "EMAILED CONTACTS" in the filter only the "Emailed contacts" folder is displayed', async () => {
			populateFoldersStore();
			const folderName = 'Emailed contacts';

			const foldersCount = getFoldersArray().reduce<number>(
				(result, folder) => (isEmailedContacts(folder.id) ? result + 1 : result),
				0
			);
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: true,
				showTrashFolder: false,
				selectedFolderId: FOLDERS.CONTACTS,
				onFolderSelected: jest.fn()
			};
			const { user } = setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			const filterInput = screen.getByTestId('folder-name-filter');
			await user.type(filterInput, folderName);
			const accordionItems = screen.queryAllByTestId(/^folder-accordion-item-/);
			expect(accordionItems.length).toBe(foldersCount);
			expect(screen.getByTestId(`folder-accordion-item-${FOLDERS.AUTO_CONTACTS}`)).toBeVisible();
		});

		test('if the user type a Contacts subfolder name in the filter that subfolder is displayed', async () => {
			populateFoldersStore();
			const contactsFolder = getFolder(FOLDERS.CONTACTS);
			if (!contactsFolder) {
				return;
			}
			const { children: inboxChildren } = contactsFolder;
			if (!inboxChildren.length) {
				return;
			}
			const inboxFirstChild = inboxChildren[0];
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				selectedFolderId: FOLDERS.CONTACTS,
				onFolderSelected: jest.fn()
			};
			const { user } = setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			const filterInput = screen.getByTestId('folder-name-filter');
			await user.type(filterInput, inboxFirstChild.name);
			expect(screen.getByTestId(`folder-accordion-item-${inboxFirstChild.id}`)).toBeVisible();
		});

		test('if the user type a folder name existing in only one account only tthat account with results is displayed', async () => {
			populateFoldersStore();
			const rootIds = Object.keys(getRootsMap());
			const folders = getFoldersArrayByRoot(rootIds[0]);
			const folderInPrimaryAccountOnly = folders.find((folder) => folder.name === 'blacklisted');
			if (!folderInPrimaryAccountOnly) {
				return;
			}
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				onFolderSelected: jest.fn()
			};
			const { user } = setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			const filterInput = screen.getByTestId('folder-name-filter');
			await user.type(filterInput, folderInPrimaryAccountOnly.name);
			const roots = getRootsMap();
			const ownerAccountName = getFolderOwnerAccountName(folderInPrimaryAccountOnly.id, roots);

			rootIds.forEach((rootId) => {
				if (rootId === rootIds[0]) {
					const accordionItems = screen.queryAllByTestId(/^folder-accordion-item-/);

					expect(screen.queryByText(ownerAccountName)).toBeVisible();
					expect(accordionItems.length).toBe(1);
				}
				if (rootId !== rootIds[0]) {
					const nullResultsAccountName = getFolder(rootId)?.name as string;
					expect(screen.queryByText(nullResultsAccountName)).not.toBeInTheDocument();
				}
			});
		});
	});

	describe('configuration options', () => {
		test('no shared account is visible if the showSharedAccount is set to false', () => {
			populateFoldersStore();
			const roots = getRootsMap();
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();

			// Cycle through all the roots, except for the primary account root
			Object.keys(roots)
				.filter((rootId) => !isRoot(rootId))
				.forEach((rootId) => {
					const ownerAccountName = getFolderOwnerAccountName(rootId, roots);
					expect(screen.queryByText(ownerAccountName)).not.toBeInTheDocument();
				});
		});

		test('no Trash folder is visible if the showTrashFolder is set to false', () => {
			populateFoldersStore();
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();

			const folders = getFoldersArrayByRoot(FOLDERS.USER_ROOT);
			const trashFolder = folders.filter((folder) => isTrash(folder.id))?.[0];
			if (!trashFolder) {
				return;
			}
			expect(
				screen.queryByTestId(`folder-accordion-item-${trashFolder.id}`)
			).not.toBeInTheDocument();
		});

		test('Trash folder is visible if the showTrashFolder is set to true', () => {
			populateFoldersStore();
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: true,
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();

			const folders = getFoldersArrayByRoot(FOLDERS.USER_ROOT);
			const trashFolder = folders.filter((folder) => isTrash(folder.id))?.[0];
			if (!trashFolder) {
				return;
			}
			expect(screen.queryByTestId(`folder-accordion-item-${trashFolder.id}`)).toBeVisible();
		});

		test('no trashed folder is visible if the showTrashFolder is set to false', () => {
			populateFoldersStore();
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();

			const folders = getFoldersArrayByRoot(FOLDERS.USER_ROOT);
			const trashedFolder = folders.filter(
				(folder) => isTrashed({ folder }) && !isTrash(folder.id)
			)?.[0];
			if (!trashedFolder) {
				return;
			}
			expect(
				screen.queryByTestId(`folder-accordion-item-${trashedFolder.id}`)
			).not.toBeInTheDocument();
		});

		test("doesn't display the Contacts folder if it has been added to the exclusions list", () => {
			populateFoldersStore();
			const props: FolderTreeSelectorProps = {
				allowFolderCreation: false,
				allowRootSelection: false,
				showSharedAccounts: false,
				showTrashFolder: false,
				excludeIds: [FOLDERS.CONTACTS],
				onFolderSelected: jest.fn()
			};
			setupTest(<FolderTreeSelector {...props} />);
			makeListItemsVisible();
			expect(
				screen.queryByTestId(`folder-accordion-item-${FOLDERS.CONTACTS}`)
			).not.toBeInTheDocument();
		});
	});
});
