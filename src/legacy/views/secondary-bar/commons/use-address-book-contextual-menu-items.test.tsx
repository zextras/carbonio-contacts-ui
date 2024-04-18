/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAddressBookContextualMenuItems } from './use-address-book-contextual-menu-items';
import { FOLDERS } from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { ACTION_IDS } from '../../../../constants';

describe('useAddressBookContextualMenuItems', () => {
	describe('Non-system address book', () => {
		it('should return 2 action', () => {
			const addressBook = generateFolder({
				n: 15,
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toHaveLength(3);
		});

		it('should return the trash action', () => {
			const addressBook = generateFolder({
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: ACTION_IDS.trashAddressBook })])
			);
		});

		it('should return the empty action', () => {
			const addressBook = generateFolder({
				n: 15,
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: ACTION_IDS.emptyAddressBook })])
			);
		});

		it('should return the export address book action', () => {
			const addressBook = generateFolder({
				n: 15,
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: ACTION_IDS.exportAddressBook })])
			);
		});
	});

	describe('Trash', () => {
		it('should return 1 action', () => {
			const addressBook = generateFolder({
				n: 15,
				id: FOLDERS.TRASH,
				absFolderPath: '/Trash',
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toHaveLength(1);
		});

		it('should return the empty trash action', () => {
			const addressBook = generateFolder({
				n: 15,
				id: FOLDERS.TRASH,
				absFolderPath: '/Trash',
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: ACTION_IDS.emptyTrash })])
			);
		});
	});

	describe('Trashed address book', () => {
		it('should return 1 action', () => {
			const addressBook = generateFolder({
				n: 15,
				absFolderPath: '/Trash/nested',
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toHaveLength(1);
		});

		it('should return the delete action', () => {
			const addressBook = generateFolder({
				absFolderPath: '/Trash/nested',
				view: 'contact'
			});
			const { result } = setupHook(useAddressBookContextualMenuItems, {
				initialProps: [addressBook]
			});
			expect(result.current).toEqual(
				expect.arrayContaining([expect.objectContaining({ id: ACTION_IDS.deleteAddressBook })])
			);
		});
	});
});
