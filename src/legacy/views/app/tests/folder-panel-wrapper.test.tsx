/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, fireEvent } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { FOLDER_VIEW, FOLDERS, JSNS, useTagStore } from '@zextras/carbonio-ui-commons';
import { forEach } from 'lodash';

import { getAction, useAppContext } from '../../../../../__mocks__/@zextras/carbonio-shell-ui';
import {
	makeListItemsVisible,
	screen,
	setupTest,
	triggerLoadMore,
	UserEvent,
	within
} from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';
import {
	ActionDescriptorType,
	ACTIONS_DESCRIPTORS,
	DISPLAY_ASSERTION,
	DisplayAssertionType,
	EMPTY_LIST_HINT,
	FolderDescriptorType,
	FOLDERS_DESCRIPTORS,
	TESTID_SELECTORS
} from 'constants/tests';
import { SoapContact } from 'legacy/types/soap';
import { FolderPanelWrapper } from 'legacy/views/app/folder-panel-wrapper';
import { createContactsApiInterceptor, findContactInList } from 'legacy/views/app/tests/utils';
import { ContactActionRequest, ContactActionResponse } from 'network/api/contact-action';
import { registerDeleteContactHandler } from 'tests/msw-handlers/delete-contact';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from 'tests/msw-handlers/find-contact-groups';
import { createSoapContact, createSoapContactGroup } from 'tests/utils';
import { SearchContactsRequest, SearchContactsSoapResponse } from 'types/index.d';

const mockMailToAction = (execute = vi.fn()): void => {
	getAction.mockImplementation((type, id) => {
		if (type !== 'contact-list' || id !== 'mail-to') {
			return [undefined, false];
		}

		const action = {
			id: 'mail-to',
			label: 'Send Mail',
			execute
		};

		return [action, true];
	});
};

function setupFolderPanel(folderId: string): ReturnType<typeof setupTest> {
	return setupTest(<FolderPanelWrapper />, {
		initialEntries: [`/folder/${folderId}`],
		path: 'folder/:folderId/:type?/:itemId?'
	});
}

async function toggleSelectContactTypeFilter(user: UserEvent): Promise<void> {
	const selectContactsViewDropdown = await screen.findByTestId('icon: ChevronDownOutline');
	return user.click(selectContactsViewDropdown);
}

function registerSearchContacts(soapContacts: Array<SoapContact>): void {
	createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
		cn: soapContacts,
		more: false,
		offset: 0,
		sortBy: 'nameAsc'
	});
}

describe('Folder panel', () => {
	beforeEach(() => {
		populateFoldersStore();
	});
	it('should show the empty list message if there is no contact or contact group', async () => {
		const folderId = '7';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});

		setupFolderPanel(folderId);

		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	it('should return an empty fragment if folder id is not valid', async () => {
		const folderId = 'a-non-valid-folder-id';

		const { container } = setupFolderPanel(folderId);

		expect(container).toBeEmptyDOMElement();
	});

	describe('Pagination', () => {
		it('should load more results when scrolling bottom of the list', async () => {
			const folderId = FOLDERS.CONTACTS;
			const firstSearchInterceptor = createContactsApiInterceptor({
				items: [createSoapContactGroup(`First group`, [], 'special-1', folderId)],
				more: true
			});

			setupFolderPanel(folderId);
			expect(await screen.findByText('First group')).toBeVisible();
			await firstSearchInterceptor;

			const loadMoreInterceptor = createContactsApiInterceptor({
				items: [createSoapContactGroup(`More Contact Group`, [], `more-group-1`, folderId)],
				more: false
			});
			await screen.findByTestId('list-bottom-element');
			act(() => {
				vi.advanceTimersByTime(1000);
			});
			await triggerLoadMore();
			expect(await screen.findByText('More Contact Group')).toBeVisible();
			await loadMoreInterceptor;
		});
	});

	describe('Contact', () => {
		it('should render the folder panel with the contact in the list', async () => {
			const folder = FOLDERS_DESCRIPTORS.contacts;
			const email = 'test@test.com';
			const soapContact = createSoapContact({ email });
			const firstSearchInterceptor = createContactsApiInterceptor({
				items: [soapContact],
				more: false
			});

			setupTest(<FolderPanelWrapper />, {
				initialEntries: [`/folder/${folder.id}`],
				path: `/folder/:folderId/:type?/:itemId?`
			});
			await findContactInList(soapContact);
			expect(screen.getByText(email)).toBeVisible();
			await firstSearchInterceptor;
		});

		// remove all warning as the search request is not intercepted
		// and not needed for the tests
		vi.spyOn(console, 'warn').mockImplementation(() => null);

		describe('Actions', () => {
			describe('hover actions', () => {
				describe('Send mail action', () => {
					it('should open the mail board when clicking the action and contact has an address', async () => {
						const folderId = FOLDERS.CONTACTS;
						const openMailComposer = vi.fn();
						vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
						mockMailToAction(openMailComposer);
						const soapContact = createSoapContact({ id: '1', folderId, email: 'test123@test.com' });
						registerSearchContacts([soapContact]);

						const { user } = setupFolderPanel(folderId);

						const listElement = await screen.findByTestId(
							`custom-contact-list-item-${soapContact.id}`
						);
						makeListItemsVisible();
						expect(listElement).toBeVisible();
						const action = screen.getByTestId('icon: MailModOutline');
						await user.click(action);
						expect(openMailComposer).toHaveBeenCalledTimes(1);
						// TODO: check how this is being called
						// expect(openMailComposer).toHaveBeenCalledWith({
						// 	recipients: [expect.objectContaining({ email: memberEmail })]
						// });
					});
				});
				describe('Restore', () => {
					it('should restore the contact group to the selected folder', async () => {
						const anotherFolder = generateFolder({
							parent: FOLDERS.USER_ROOT,
							name: 'anotherContactFolder',
							id: '500',
							absFolderPath: '/anotherContactFolder',
							view: FOLDER_VIEW.contact,
							children: []
						});
						populateFoldersStore({
							customFolders: [anotherFolder]
						});
						const folderId = FOLDERS.TRASH;
						const soapContact = createSoapContact({ id: '1', folderId });
						registerSearchContacts([soapContact]);
						const restoreInterceptor = createSoapAPIInterceptor<
							ContactActionRequest,
							ContactActionResponse
						>('ContactAction', {
							_jsns: JSNS.MAIL,
							action: { id: soapContact.id, op: 'move' },
							requestId: '123'
						});

						const { user } = setupFolderPanel(folderId);

						const listElement = await screen.findByTestId(
							`custom-contact-list-item-${soapContact.id}`
						);
						makeListItemsVisible();
						expect(listElement).toBeVisible();
						const restoreAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.restore
						);
						await act(() => user.click(restoreAction));
						act(() => {
							vi.advanceTimersByTime(1000);
						});
						const restoreModal = await screen.findByTestId('modal');
						makeListItemsVisible();
						await user.click(screen.getByTestId(`folder-accordion-item-${anotherFolder.id}`));
						const restoreButton = within(restoreModal).getByRole('button', { name: /restore/i });
						expect(restoreButton).toBeEnabled();
						await act(() => user.click(restoreButton));

						const contactActionRequest = await restoreInterceptor;
						expect(contactActionRequest).toEqual({
							_jsns: JSNS.MAIL,
							action: {
								id: soapContact.id,
								op: 'move',
								l: anotherFolder.id
							}
						});
					});
				});
				describe('Delete (move to trash) contact action', () => {
					it('should call move operation when calling the action', async () => {
						populateFoldersStore();
						const folderId = FOLDERS.CONTACTS;
						const soapContact = createSoapContact({ id: '1', folderId });
						registerSearchContacts([soapContact]);
						const moveToTrashSoapInterceptor = createSoapAPIInterceptor<
							ContactActionRequest,
							ContactActionResponse
						>('ContactAction', {
							_jsns: JSNS.MAIL,
							action: { id: soapContact.id, op: 'trash' },
							requestId: ''
						});

						const { user } = setupFolderPanel(folderId);

						const listElement = await screen.findByTestId(
							`custom-contact-list-item-${soapContact.id}`
						);
						makeListItemsVisible();
						expect(listElement).toBeVisible();
						const trashAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.trash
						);
						await act(() => user.click(trashAction));

						const trashRequest = await moveToTrashSoapInterceptor;
						expect(trashRequest).toEqual({
							_jsns: JSNS.MAIL,
							action: {
								id: soapContact.id,
								op: 'trash'
							}
						});
					});
				});
				describe('Delete permanently (trash folder) contact action', () => {
					it('should call ContactAction api when you confirm delete and api call succeeds', async () => {
						populateFoldersStore();
						const folderId = FOLDERS.TRASH;
						const soapContact1 = createSoapContact({ id: '1', folderId });
						const soapContact2 = createSoapContact({ id: '2', folderId });
						const soapContact3 = createSoapContact({ id: '3', folderId });
						registerSearchContacts([soapContact1, soapContact2, soapContact3]);
						const deletePermanentlySoapInterceptor = createSoapAPIInterceptor<
							ContactActionRequest,
							ContactActionResponse
						>('ContactAction', {
							_jsns: JSNS.MAIL,
							action: { id: soapContact1.id, op: 'delete' },
							requestId: ''
						});

						const { user } = setupFolderPanel(folderId);

						const listElement = await screen.findByTestId(
							`custom-contact-list-item-${soapContact1.id}`
						);
						makeListItemsVisible();
						expect(listElement).toBeVisible();
						const deleteAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.deletePermanently
						);
						await user.click(deleteAction);
						const button = await screen.findByRole('button', {
							name: /delete permanently/i
						});
						await user.click(button);
						await screen.findByText('Contact permanently deleted');
						const deletePermanentlyRequest = await deletePermanentlySoapInterceptor;
						expect(deletePermanentlyRequest).toEqual({
							_jsns: JSNS.MAIL,
							action: {
								id: soapContact1.id,
								op: 'delete'
							}
						});
					});
				});
			});
			describe('Hover actions visibility', () => {
				it.each`
					folder                              | action                                            | assertion
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.display}
				`(
					`should $assertion.desc the action $action.desc for a contact in the "$folder.desc" folder`,
					async ({
						folder,
						action,
						assertion
					}: {
						folder: FolderDescriptorType;
						action: ActionDescriptorType;
						assertion: DisplayAssertionType;
					}) => {
						populateFoldersStore();
						mockMailToAction();
						const email = 'test@test.com';
						const soapContact = createSoapContact({ email, folderId: folder.id });
						createContactsApiInterceptor({
							items: [soapContact],
							more: false
						});

						const { user } = setupTest(<FolderPanelWrapper />, {
							initialEntries: [`/folder/${folder.id}`],
							path: `/folder/:folderId/:type?/:itemId?`
						});
						await findContactInList(soapContact);

						const listItem = screen.getByText(email);
						await user.hover(listItem);
						if (assertion.value) {
							expect(
								screen.getByRoleWithIcon('button', {
									icon: `icon: ${action.icon}`,
									hidden: true
								})
							).toBeInTheDocument();
						} else {
							expect(
								screen.queryByRoleWithIcon('button', {
									icon: `icon: ${action.icon}`
								})
							).not.toBeInTheDocument();
						}
					}
				);
			});

			describe('Contextual menu actions visibility', () => {
				it.each`
					folder                              | action                                            | assertion
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.applyTag}          | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.applyTag}          | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.notDisplay}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.applyTag}          | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.display}
				`(
					`should $assertion.desc the action $action.desc for a contact in the "$folder.desc" folder`,
					async ({
						folder,
						action,
						assertion
					}: {
						folder: FolderDescriptorType;
						action: ActionDescriptorType;
						assertion: DisplayAssertionType;
					}) => {
						populateFoldersStore();
						mockMailToAction();
						const email = 'test@test.com';
						const soapContact = createSoapContact({ email, folderId: folder.id });
						createContactsApiInterceptor({
							items: [soapContact],
							more: false
						});

						const { user } = setupTest(<FolderPanelWrapper />, {
							initialEntries: [`/folder/${folder.id}`],
							path: `/folder/:folderId/:type?/:itemId?`
						});
						await findContactInList(soapContact);

						const listItem = screen.getByText(email);
						await act(() => user.rightClick(listItem));
						const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
						if (assertion.value) {
							expect(within(dropdown).getByText(action.desc)).toBeVisible();
							expect(within(dropdown).getByTestId(`icon: ${action.icon}`)).toBeVisible();
						} else {
							expect(within(dropdown).queryByText(action.desc)).not.toBeInTheDocument();
							expect(
								within(dropdown).queryByTestId(`icon: ${action.icon}`)
							).not.toBeInTheDocument();
						}
					}
				);

				it('applying tag should call ContactAction with op tag', async () => {
					populateFoldersStore();

					const contactsFolder = FOLDERS_DESCRIPTORS.contacts;
					const email = 'test@test.com';
					const soapContact = createSoapContact({ email, folderId: contactsFolder.id });
					createContactsApiInterceptor({
						items: [soapContact],
						more: false
					});

					useTagStore.setState({ tags: { '1': { id: '1', name: 'testTag' } } });
					const { user } = setupTest(<FolderPanelWrapper />, {
						initialEntries: [`/folder/${contactsFolder.id}`],
						path: `/folder/:folderId/:type?/:itemId?`
					});
					await findContactInList(soapContact);
					const contactListItem = await screen.findByTestId(`contact-list-item-${soapContact.id}`);
					expect(contactListItem).toBeVisible();
					const contactListItemName = within(contactListItem).getByText(email);
					await act(() => user.rightClick(contactListItemName));
					const dropdown = await screen.findByTestId('dropdown-popper-list');
					expect(dropdown).toBeVisible();
					const tagMenuItem = within(dropdown).getByText('Tags');
					// eslint-disable-next-line testing-library/prefer-user-event
					fireEvent.mouseOver(tagMenuItem);
					const tag = await screen.findByText('testTag');
					const soapAPIInterceptor = createSoapAPIInterceptor<
						ContactActionRequest,
						ContactActionResponse
					>('ContactAction', {
						_jsns: JSNS.MAIL,
						action: {
							op: 'tag',
							id: soapContact.id
						}
					});
					await user.click(tag);
					await screen.findByText('"testTag" tag applied');
					const contactActionRequest = await soapAPIInterceptor;
					expect(contactActionRequest.action).toEqual(
						expect.objectContaining({ id: soapContact.id, tn: 'testTag', op: 'tag' })
					);
				});
			});

			describe('Multiple selection', () => {
				it('should not display any primary action', async () => {
					useAppContext.mockReturnValue({ count: 42, setCount: vi.fn() });
					const folder = FOLDERS_DESCRIPTORS.contacts;
					const soapContact1 = createSoapContact();
					const contacts = [soapContact1, createSoapContact()];
					createContactsApiInterceptor({
						items: contacts,
						more: false
					});

					const { user } = setupTest(<FolderPanelWrapper />, {
						initialEntries: [`/folder/${folder.id}`],
						path: `/folder/:folderId/:type?/:itemId?`
					});
					await findContactInList(soapContact1);

					// Select all the items
					const listItems = screen.getAllByTestId(TESTID_SELECTORS.contactsListItem);
					forEach(listItems, async (listItem) => {
						const avatar = within(listItem).getByTestId(TESTID_SELECTORS.avatar);
						await user.click(avatar);
					});

					await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.exitSelection });
					expect(screen.queryByTestId(/primary-action-button-/)).not.toBeInTheDocument();
				});

				describe('Multiple selection actions visibility', () => {
					it.each`
						folder                              | action                                            | assertion
						${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
						${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.applyMultiTag}     | ${DISPLAY_ASSERTION.display}
						${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
						${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
						${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.applyMultiTag}     | ${DISPLAY_ASSERTION.display}
						${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
						${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.notDisplay}
						${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.applyMultiTag}     | ${DISPLAY_ASSERTION.display}
						${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.display}
					`(
						`should $assertion.desc the action $action.desc for a contact in the "$folder.desc" folder`,
						async ({
							folder,
							action,
							assertion
						}: {
							folder: FolderDescriptorType;
							action: ActionDescriptorType;
							assertion: DisplayAssertionType;
						}) => {
							populateFoldersStore();
							const soapContact1 = createSoapContact({ folderId: folder.id });
							const contacts = [soapContact1, createSoapContact({ folderId: folder.id })];
							createContactsApiInterceptor({
								items: contacts,
								more: false
							});
							useAppContext.mockReturnValue({ count: 42, setCount: vi.fn() });

							const { user } = setupTest(<FolderPanelWrapper />, {
								initialEntries: [`/folder/${folder.id}`],
								path: `/folder/:folderId/:type?/:itemId?`
							});
							await findContactInList(soapContact1);
							makeListItemsVisible();

							// Select all the items
							const listItems = screen.getAllByTestId(TESTID_SELECTORS.contactsListItem);
							forEach(listItems, async (listItem) => {
								const avatar = within(listItem).getByTestId(TESTID_SELECTORS.avatar);
								await user.click(avatar);
							});

							const buttonMoreOption = await screen.findByRoleWithIcon('button', {
								icon: TESTID_SELECTORS.icons.moreOptions
							});

							await act(() => user.click(buttonMoreOption));

							const dropdown = await screen.findByTestId('dropdown-popper-list');
							if (assertion.value) {
								expect(within(dropdown).getByText(action.desc)).toBeVisible();
								expect(within(dropdown).getByTestId(`icon: ${action.icon}`)).toBeVisible();
							} else {
								expect(within(dropdown).queryByText(action.desc)).not.toBeInTheDocument();
								expect(
									within(dropdown).queryByTestId(`icon: ${action.icon}`)
								).not.toBeInTheDocument();
							}
						}
					);
				});
			});
		});
	});
	describe('Contact Group', () => {
		describe('list item', () => {
			it('should render the avatar, the name and the number of the members (case 1+ addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				const folderId = '7';
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createSoapContactGroup(
							contactGroupName,
							[faker.internet.email(), faker.internet.email()],
							'1',
							folderId
						)
					]),
					offset: 0
				});
				setupFolderPanel(folderId);

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
				expect(screen.getByText('2 addresses')).toBeVisible();
			});
			it('should render the avatar, the name and the number of the members (case 0 addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				const folderId = '7';
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createSoapContactGroup(contactGroupName, [], '1', folderId)
					]),
					offset: 0
				});
				setupFolderPanel(folderId);

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
				expect(screen.getByText('0 addresses')).toBeVisible();
			});
			it('should render the avatar, the name and the number of the members (case 1 addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				const folderId = '7';
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createSoapContactGroup(contactGroupName, [faker.internet.email()], '1', folderId)
					]),
					offset: 0
				});
				setupFolderPanel(folderId);

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
				expect(screen.getByText('1 address')).toBeVisible();
			});

			describe('hover actions', () => {
				describe('Send mail action', () => {
					it('should open the mail board when clicking the action and group has at least one member', async () => {
						const openMailComposer = vi.fn();
						vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
						const contactGroupName = faker.company.name();
						const folderId = '7';
						const memberEmail = faker.internet.email();
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse([
								createSoapContactGroup(contactGroupName, [memberEmail], '1', folderId)
							]),
							offset: 0
						});

						const { user } = setupFolderPanel(folderId);

						await screen.findAllByText(contactGroupName);
						const action = screen.getByTestId(TESTID_SELECTORS.icons.sendEmail);
						await user.click(action);
						expect(openMailComposer).toHaveBeenCalledTimes(1);
						expect(openMailComposer).toHaveBeenCalledWith({
							recipients: [expect.objectContaining({ email: memberEmail })]
						});
					});
					it('should display send mail hover action as disabled when the contact group has 0 members', async () => {
						const openMailComposer = vi.fn();
						const folderId = '7';
						vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
						const contactGroupName = faker.company.name();
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse([
								createSoapContactGroup(contactGroupName, [], '1', folderId)
							]),
							offset: 0
						});

						setupFolderPanel(folderId);

						await screen.findAllByText(contactGroupName);
						const mailToIcon = screen.getByRoleWithIcon('button', {
							icon: TESTID_SELECTORS.icons.sendEmail,
							hidden: true
						});
						expect(mailToIcon).toBeInTheDocument();
						expect(mailToIcon).toBeDisabled();
					});
				});
				describe('Restore', () => {
					it('should restore the contact group to the selected folder', async () => {
						const anotherFolder = generateFolder({
							parent: FOLDERS.USER_ROOT,
							name: 'anotherContactFolder',
							id: '500',
							absFolderPath: '/anotherContactFolder',
							view: FOLDER_VIEW.contact,
							children: []
						});
						populateFoldersStore({
							customFolders: [anotherFolder]
						});
						const folderId = FOLDERS.TRASH;
						const contactGroupName = 'Group 1';
						const cnItem1 = createSoapContactGroup(contactGroupName, [], '1', folderId);
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse([cnItem1], false),
							offset: 0
						});
						const restoreInterceptor = createSoapAPIInterceptor<
							ContactActionRequest,
							ContactActionResponse
						>('ContactAction', {
							_jsns: JSNS.MAIL,
							action: { id: cnItem1.id, op: 'move' },
							requestId: '123'
						});

						const { user } = setupFolderPanel(folderId);

						await screen.findByText(contactGroupName);
						const listElement = screen.getByTestId(`contact-group-list-item-${cnItem1.id}`);
						expect(listElement).toBeVisible();
						const restoreAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.restore
						);
						await act(() => user.click(restoreAction));
						act(() => {
							vi.advanceTimersByTime(1000);
						});
						const restoreModal = await screen.findByTestId('modal');
						await within(restoreModal).findByText(`Restore ${contactGroupName}'s contact`);
						makeListItemsVisible();
						await user.click(screen.getByTestId(`folder-accordion-item-${anotherFolder.id}`));
						const restoreButton = within(restoreModal).getByRole('button', { name: /restore/i });
						expect(restoreButton).toBeEnabled();
						await act(() => user.click(restoreButton));

						const contactActionRequest = await restoreInterceptor;
						expect(contactActionRequest).toEqual({
							_jsns: JSNS.MAIL,
							action: {
								id: cnItem1.id,
								op: 'move',
								l: anotherFolder.id
							}
						});
					});
				});
				describe('Delete (move to trash) contact group action', () => {
					it('should call move operation when calling the action', async () => {
						populateFoldersStore();
						const folderId = FOLDERS.CONTACTS;
						const contactGroupName = 'Group 1';
						const cnItem1 = createSoapContactGroup(contactGroupName, [], '1', folderId);
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse([cnItem1], false),
							offset: 0
						});
						const moveToTrashSoapInterceptor = createSoapAPIInterceptor<
							ContactActionRequest,
							ContactActionResponse
						>('ContactAction', {
							_jsns: JSNS.MAIL,
							action: { id: cnItem1.id, op: 'trash' },
							requestId: ''
						});

						const { user } = setupFolderPanel(folderId);

						await screen.findByText(contactGroupName);
						const listElement = screen.getByTestId(`contact-group-list-item-${cnItem1.id}`);
						expect(listElement).toBeVisible();
						const trashAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.trash
						);
						await act(() => user.click(trashAction));

						const trashRequest = await moveToTrashSoapInterceptor;
						expect(trashRequest).toEqual({
							_jsns: JSNS.MAIL,
							action: {
								id: cnItem1.id,
								op: 'trash'
							}
						});
					});
				});
				describe('Delete permanently (trash folder) contact group action', () => {
					it('should remove deleted contact group when you confirm deletion and api call will success (Hover trigger)', async () => {
						const folderId = FOLDERS.TRASH;
						const cnItem1 = createSoapContactGroup('Group 1', [], '1', folderId);
						const cnItem2 = createSoapContactGroup('Group 2', [], '2', folderId);
						const cnItem3 = createSoapContactGroup('Group 3', [], '3', folderId);
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse(
								[cnItem1, cnItem2, cnItem3],
								false
							),
							offset: 0
						});
						registerDeleteContactHandler(cnItem1.id);

						const { user } = setupFolderPanel(folderId);

						await screen.findByText(cnItem1.fileAsStr);

						const listElement = screen.getByTestId(`contact-group-list-item-${cnItem1.id}`);

						expect(listElement).toBeVisible();

						const deleteAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.deletePermanently
						);

						await user.click(deleteAction);
						const button = await screen.findByRole('button', {
							name: /delete permanently/i
						});
						await user.click(button);
						await screen.findByText('Contact group successfully deleted');
					});
					it('should not remove deleted contact group when you confirm deletion and api call fail (Hover trigger)', async () => {
						vi.spyOn(console, 'warn').mockImplementation(() => null);
						const folderId = FOLDERS.TRASH;
						const cnItem1 = createSoapContactGroup('Group 1', [], '11', folderId);
						const cnItem2 = createSoapContactGroup('Group 2', [], '22', folderId);
						const cnItem3 = createSoapContactGroup('Group 3', [], '33', folderId);
						populateFoldersStore();
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse(
								[cnItem1, cnItem2, cnItem3],
								false
							),
							offset: 0
						});
						registerDeleteContactHandler(cnItem1.id, 'error-string');

						const { user } = setupFolderPanel(folderId);
						await screen.findByText(cnItem1.fileAsStr);

						const listElement = screen.getByTestId(`contact-group-list-item-${cnItem1.id}`);

						expect(listElement).toBeVisible();

						const deleteAction = within(listElement as HTMLElement).getByTestId(
							TESTID_SELECTORS.icons.deletePermanently
						);

						await user.click(deleteAction);
						const modalButton = await screen.findByRole('button', {
							name: /delete permanently/i
						});
						await user.click(modalButton);
						await screen.findByText('Something went wrong, please try again');

						expect(screen.getByText(cnItem1.fileAsStr)).toBeVisible();
						expect(screen.getByText(cnItem2.fileAsStr)).toBeVisible();
						expect(screen.getByText(cnItem3.fileAsStr)).toBeVisible();
					});
				});
			});
			describe('contextual menu actions', () => {
				describe('Send mail action', () => {
					it('should open the mail board', async () => {
						const openMailComposer = vi.fn();
						const folderId = '7';
						vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
						const contactGroupName = faker.company.name();
						const contactGroupId = '1';
						const member = faker.internet.email();
						registerFindContactGroupsHandler({
							findContactGroupsResponse: createFindContactGroupsResponse([
								createSoapContactGroup(contactGroupName, [member], contactGroupId, folderId)
							]),
							offset: 0
						});

						const { user } = setupFolderPanel(folderId);

						await user.rightClick(await screen.findByText(contactGroupName));
						const contextualMenu = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
						const sendAction = within(contextualMenu).getByText('Send e-mail');
						await user.click(sendAction);

						expect(openMailComposer).toHaveBeenCalledTimes(1);
						expect(openMailComposer).toHaveBeenCalledWith({
							recipients: [expect.objectContaining({ email: member })]
						});
					});
				});
			});
		});
	});

	describe('Select contact type filter', () => {
		it('should display contacts and contact groups by default', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactEmail = 'test@mycontact.com';
			const soapContact = createSoapContact({ folderId, email: soapContactEmail });
			const soapContactGroup = createSoapContactGroup(
				contactGroupName,
				[faker.internet.email(), faker.internet.email()],
				'1',
				folderId
			);
			const searchContactsInterceptor = createContactsApiInterceptor({
				items: [soapContact, soapContactGroup]
			});

			setupFolderPanel(folderId);

			const searchContactsRequest = await searchContactsInterceptor;

			expect(searchContactsRequest.query?._content).toBe(`inid:"${folderId}"`);
			expect(await screen.findByText(contactGroupName)).toBeVisible();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();
		});
		it('should display only contact groups after selecting contact groups filter', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactGroup = createSoapContactGroup(
				contactGroupName,
				[faker.internet.email(), faker.internet.email()],
				'1',
				folderId
			);
			const searchAllContactsInterceptor = createContactsApiInterceptor({ items: [] });

			const { user } = setupFolderPanel(folderId);

			await searchAllContactsInterceptor;
			expect(screen.queryByText(contactGroupName)).not.toBeInTheDocument();
			await toggleSelectContactTypeFilter(user);
			const searchContactGroupsInterceptor = createContactsApiInterceptor({
				items: [soapContactGroup]
			});
			await user.click(await screen.findByText('Contact Groups'));
			expect(await screen.findByText(contactGroupName)).toBeVisible();
			const contactGroupsRequest = await searchContactGroupsInterceptor;

			expect(contactGroupsRequest.query?._content).toBe(`inid:"${folderId}" and #type:group`);
			expect(await screen.findByText(contactGroupName)).toBeInTheDocument();
		});
		it('should display only contacts after selecting contacts filter', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactEmail = 'test@mycontact.com';
			const soapContact = createSoapContact({ folderId, email: soapContactEmail });
			const soapContactGroup = createSoapContactGroup(
				contactGroupName,
				[faker.internet.email(), faker.internet.email()],
				'1',
				folderId
			);
			const searchAllContactsInterceptor = createContactsApiInterceptor({
				items: [soapContactGroup]
			});

			const { user } = setupFolderPanel(folderId);

			await searchAllContactsInterceptor;
			expect(await screen.findByText(contactGroupName)).toBeInTheDocument();
			const searchOnlyContactsInterceptor = createContactsApiInterceptor({
				items: [soapContact]
			});
			await toggleSelectContactTypeFilter(user);
			await user.click(await screen.findByText('Contacts'));
			const contactsOnlyRequest = await searchOnlyContactsInterceptor;
			expect(
				await screen.findByTestId(`contact-list-item-invisible-${soapContact.id}`)
			).toBeInTheDocument();
			expect(screen.queryByText(contactGroupName)).not.toBeInTheDocument();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();

			expect(contactsOnlyRequest.query?._content).toBe(`inid:"${folderId}" and not #type:group`);
		});

		it('should display contacts and contact groups after selecting all filter', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactEmail = 'test@mycontact.com';
			const soapContact = createSoapContact({ folderId, email: soapContactEmail });
			const soapContactGroup = createSoapContactGroup(
				contactGroupName,
				[faker.internet.email(), faker.internet.email()],
				'1',
				folderId
			);
			const searchAllContactsInterceptor = createContactsApiInterceptor({
				items: [soapContactGroup]
			});

			const { user } = setupFolderPanel(folderId);

			await searchAllContactsInterceptor;
			expect(await screen.findByText(contactGroupName)).toBeInTheDocument();
			const searchOnlyContactsInterceptor = createContactsApiInterceptor({
				items: [soapContact]
			});
			await toggleSelectContactTypeFilter(user);
			await user.click(await screen.findByText('Contacts'));
			const contactsOnlyRequest = await searchOnlyContactsInterceptor;
			expect(
				await screen.findByTestId(`contact-list-item-invisible-${soapContact.id}`)
			).toBeInTheDocument();
			expect(screen.queryByText(contactGroupName)).not.toBeInTheDocument();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();

			expect(contactsOnlyRequest.query?._content).toBe(`inid:"${folderId}" and not #type:group`);

			const searchContactsInterceptor = createContactsApiInterceptor({
				items: [soapContact, soapContactGroup]
			});

			await toggleSelectContactTypeFilter(user);
			await user.click(await screen.findByText('All'));

			const searchContactsRequest = await searchContactsInterceptor;

			expect(searchContactsRequest.query?._content).toBe(`inid:"${folderId}"`);
			expect(await screen.findByText(contactGroupName)).toBeVisible();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();
		});
	});

	describe('Display breadcrumbs', () => {
		it('should display count and folder path of the folder in breadcrumbs', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactEmail = 'demo@mycontact.com';
			const soapContact = createSoapContact({ folderId, email: soapContactEmail });
			const soapContactGroup = createSoapContactGroup(
				contactGroupName,
				[faker.internet.email(), faker.internet.email()],
				'1',
				folderId
			);
			const searchContactsInterceptor = createContactsApiInterceptor({
				items: [soapContact, soapContactGroup]
			});

			setupFolderPanel(folderId);
			const searchContactsRequest = await searchContactsInterceptor;

			expect(searchContactsRequest.query?._content).toBe(`inid:"${folderId}"`);
			expect(await screen.findByText(contactGroupName)).toBeVisible();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();

			expect(screen.getByTestId('BreadcrumbCount')).toHaveTextContent('2');
			expect(screen.getByTestId('BreadcrumbPath')).toHaveTextContent('/ Contacts');
		});
	});
});
