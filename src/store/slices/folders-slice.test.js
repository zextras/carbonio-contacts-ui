/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { configureStore, nanoid } from '@reduxjs/toolkit';
// import faker from 'faker';
import { filter, head } from 'lodash';
import { createFolder } from '../actions/create-folder';
import reducers from '../reducers/reducers';
import { folderAction } from '../actions/folder-action';

describe.skip('Folders Slice', () => {
	test('Create new folder', async () => {
		const store = configureStore({
			reducer: reducers,
			preloadedState: {
				folders: {
					status: 'succeeded',
					folders: [
						{
							id: '7',
							itemsCount: 0,
							label: 'Contacts',
							parent: '1',
							absParent: '1',
							path: '/Contacts',
							deletable: false,
							size: 0,
							view: 'contact',
							cn: [],
							unreadCount: 0,
							all: {}
						}
					]
				}
			}
		});

		const folder = {
			parent: '7',
			// name: faker.name.firstName(),
			view: 'contact',
			absParent: '1'
		};
		expect(store.getState().folders.folders).toMatchObject({});
		const { payload } = await store.dispatch(
			createFolder({ parentFolder: folder, name: folder.name })
		);
		const { id } = payload[0];

		expect(head(filter(store.getState().folders.folders, (item) => item.id === id))).toBeDefined();
	});
	describe('Folder Actions', () => {
		test('Move folder', async () => {
			const store = configureStore({
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: [
							{
								id: '7',
								itemsCount: 0,
								label: 'Contacts',
								parent: '1',
								absParent: '1',
								path: '/Contacts',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: [],
								unreadCount: 0,
								all: {}
							}
						]
					}
				}
			});
			const parentFolder = head(
				filter(store.getState().folders.folders, (item) => item.id === '7')
			);
			const { payload } = await store.dispatch(
				createFolder({ parentFolder, name: 'New Folder', id: nanoid() })
			);

			const { id } = payload[0];
			const folder = head(filter(store.getState().folders.folders, (item) => item.id === id));

			expect(folder).toBeDefined();
			expect(folder.parent).toEqual(parentFolder.id);

			const res = await store.dispatch(folderAction({ folder, l: '3', op: 'move' }));

			const newValue = head(
				filter(store.getState().folders.folders, (item) => item.id === res.payload.action.id)
			);
			expect(newValue.parent).toEqual('3');
			expect(newValue.absParent).toEqual('3');
		});

		test('Empty folder', async () => {
			const store = configureStore({
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: [
							{
								id: '3',
								itemsCount: 1,
								label: 'Trash',
								parent: '1',
								absParent: '1',
								path: '/Trash',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: ['4371'],
								unreadCount: 0,
								all: {}
							}
						],
						contacts: {
							contacts: {
								3: [
									{
										URL: {},
										address: {},
										company: '',
										department: '',
										email: {},
										firstName: 'dvsc',
										id: '4371',
										image: '',
										jobTitle: '',
										lastName: '',
										middleName: '',
										namePrefix: '',
										nameSuffix: '',
										nickName: '',
										notes: '',
										parent: '3',
										phone: {}
									}
								]
							},
							status: {}
						}
					}
				}
			});
			const folder = head(filter(store.getState().folders.folders, (item) => item.id === '3'));
			expect(folder).toBeDefined();
			await store.dispatch(
				folderAction({
					folder,
					op: 'empty',
					recursive: true
				})
			);

			expect(folder).toBeDefined();
			expect(folder).toMatchObject({});
		});

		test('Rename folder', async () => {
			const store = configureStore({
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: [
							{
								id: '7',
								itemsCount: 1,
								label: 'Contacts',
								parent: '1',
								absParent: '1',
								path: '/Contacts',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: ['4371'],
								all: {}
							},
							{
								id: '2432',
								itemsCount: 0,
								label: 'Mars',
								parent: '7',
								absParent: '7',
								path: '/Contacts/Mars',
								deletable: true,
								size: 0,
								view: 'contact',
								cn: [],
								all: {}
							}
						],
						contacts: {
							contacts: {
								7: [
									{
										URL: {},
										address: {},
										company: '',
										department: '',
										email: {},
										firstName: 'ssac',
										id: '4371',
										image: '',
										jobTitle: '',
										lastName: '',
										middleName: '',
										namePrefix: '',
										nameSuffix: '',
										nickName: '',
										notes: '',
										parent: '3',
										phone: {}
									}
								]
							},
							status: {}
						}
					}
				}
			});
			const contactFolder = head(
				filter(store.getState().folders.folders, (item) => item.id === '7')
			);
			const secondFolder = head(
				filter(store.getState().folders.folders, (item) => item.id === '2432')
			);

			expect(contactFolder).toBeDefined();
			expect(secondFolder).toBeDefined();
			expect(secondFolder.label).toEqual('Mars');

			await store.dispatch(folderAction({ folder: secondFolder, name: 'new name', op: 'rename' }));
			const newValue = head(filter(store.getState().folders.folders, (item) => item.id === '2432'));

			expect(newValue.label).toEqual('new name');
		});

		test('Delete folder', async () => {
			const store = configureStore({
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: [
							{
								id: '7',
								itemsCount: 1,
								label: 'Contacts',
								parent: '1',
								absParent: '1',
								path: '/Contacts',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: ['4371'],
								all: {}
							},
							{
								id: '2432',
								itemsCount: 0,
								label: 'Mars',
								parent: '3',
								absParent: '3',
								path: '/trash/Mars',
								deletable: true,
								size: 0,
								view: 'contact',
								cn: [],
								all: {}
							}
						],
						contacts: {
							contacts: {
								7: [
									{
										URL: {},
										address: {},
										company: '',
										department: '',
										email: {},
										firstName: 'ssac',
										id: '4371',
										image: '',
										jobTitle: '',
										lastName: '',
										middleName: '',
										namePrefix: '',
										nameSuffix: '',
										nickName: '',
										notes: '',
										parent: '3',
										phone: {}
									}
								]
							},
							status: {}
						}
					}
				}
			});
			const secondFolder = head(
				filter(store.getState().folders.folders, (item) => item.id === '2432')
			);

			expect(secondFolder).toBeDefined();

			await store.dispatch(
				folderAction({ folder: secondFolder, l: secondFolder.parent, op: 'delete' })
			);

			const newValue = head(filter(store.getState().folders.folders, (item) => item.id === '2432'));

			expect(newValue).toBeUndefined();
		});
	});
});
