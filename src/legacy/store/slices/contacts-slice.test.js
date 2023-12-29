/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { configureStore } from '@reduxjs/toolkit';

// import faker from 'faker';
import { contactAction } from '../actions/contact-action';
import { createContact } from '../actions/create-contact';
import { modifyContact } from '../actions/modify-contact';
import { searchContacts } from '../actions/search-contacts';
import reducers from '../reducers/reducers';

describe.skip('Contact Slice', () => {
	describe('Add new Contact', () => {
		test('From App', async () => {
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
								cn: [],
								all: {}
							}
						]
					}
				}
			});
			const contact = {
				firstName: 'firstName',
				lastName: 'lastName',
				nickName: 'nickName',
				parent: '7',
				address: '',
				company: 'company',
				department: 'department',
				email: '',
				image: '',
				jobTitle: 'jobTitle',
				notes: 'notes',
				phone: 'phone',
				nameSuffix: 'nameSuffix',
				namePrefix: 'namePrefix',
				URL: ''
			};
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(searchContacts(contact.parent));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			await store.dispatch(createContact(contact));

			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(2);
		});

		test('From Board Panel', async () => {
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
								cn: [],
								all: {}
							}
						]
					}
				}
			});
			const contact = {
				firstName: 'firstName',
				lastName: 'lastName',
				nickName: 'nickName',
				parent: '7',
				address: '',
				company: 'company',
				department: 'department',
				email: '',
				image: '',
				jobTitle: 'jobTitle',
				notes: 'notes',
				phone: 'phone',
				nameSuffix: 'nameSuffix',
				namePrefix: 'namePrefix',
				URL: ''
			};

			await store.dispatch(createContact(contact));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
		});
	});

	describe('Modify Contact', () => {
		test('Update simple fields', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(searchContacts('7'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const prevContact = store.getState().contacts.contacts[7][0];
			const updatedContact = {
				...prevContact
			};
			await store.dispatch(modifyContact({ updatedContact, editContact: prevContact }));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(prevContact).not.toMatchObject(store.getState().contacts.contacts[7][0]);
		});

		test('Update complex fields', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(searchContacts('7'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const prevContact = store.getState().contacts.contacts[7][0];
			const updatedContact = {
				...prevContact,
				address: {
					workAddress: {
						type: 'work'
					},
					homeAddress: {
						type: 'home'
					}
				},
				phone: {
					homePhone: {
						type: 'home'
					},
					mobilePhone: {
						type: 'mobile'
					},
					mobilePhone2: {
						type: 'mobile'
					}
				},
				URL: {
					homeURL: {
						type: 'home'
					},
					otherURL: {
						type: 'other'
					}
				},
				email: {
					email: {},
					email2: {}
				}
			};
			await store.dispatch(modifyContact({ prevContact, updatedContact }));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(prevContact).not.toMatchObject(store.getState().contacts.contacts[7][0]);
		});
	});

	describe('Delete Contact', () => {
		test('Move in trash - trash folder unknown', async () => {
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
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							},
							{
								id: '3',
								itemsCount: 0,
								label: 'Trash',
								parent: '1',
								absParent: '1',
								path: '/Trash',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							}
						]
					}
				}
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(searchContacts('7'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const contact = store.getState().contacts.contacts[7][0];
			await store.dispatch(
				contactAction({
					contactsIDs: [contact.id],
					originID: contact.parent,
					destinationID: contact.parent === '3' ? undefined : '3',
					op: contact.parent === '3' ? 'delete' : 'move'
				})
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(1);
		});

		test('Move in trash - trash folder known', async () => {
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
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							},
							{
								id: '3',
								itemsCount: 0,
								label: 'Trash',
								parent: '1',
								absParent: '1',
								path: '/Trash',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							}
						]
					}
				}
			});

			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();
			await store.dispatch(searchContacts('7'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();
			await store.dispatch(searchContacts('3'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
			await store.dispatch(
				contactAction({
					contactsIDs: [store.getState().contacts.contacts[7][0].id],
					originID: store.getState().contacts.contacts[7][0].parent,
					destinationID: store.getState().contacts.contacts[7][0].parent === '3' ? undefined : '3',
					op: store.getState().contacts.contacts[7][0].parent === '3' ? 'delete' : 'move'
				})
			);

			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(1);
		});

		test('Delete permanently', async () => {
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
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							},
							{
								id: '3',
								itemsCount: 0,
								label: 'Trash',
								parent: '1',
								absParent: '1',
								path: '/Trash',
								deletable: false,
								size: 0,
								view: 'contact',
								cn: [{ ids: '' }],
								unreadCount: 0,
								all: {}
							}
						]
					}
				}
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();

			await store.dispatch(searchContacts('7'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();

			await store.dispatch(searchContacts('3'));
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
			const contactMainFolder = store.getState().contacts.contacts[7][0];
			await store.dispatch(
				contactAction({
					contactsIDs: [contactMainFolder.id],
					originID: contactMainFolder.parent,
					destinationID: contactMainFolder.parent === '3' ? undefined : '3',
					op: contactMainFolder.parent === '3' ? 'delete' : 'move'
				})
			);
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(1);

			await store.dispatch(
				contactAction({
					contactsIDs: [store.getState().contacts.contacts[3][0].id],
					originID: store.getState().contacts.contacts[3][0].parent,
					destinationID: store.getState().contacts.contacts[3][0].parent === '3' ? undefined : '3',
					op: store.getState().contacts.contacts[3][0].parent === '3' ? 'delete' : 'move'
				})
			);
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
		});
	});
});
