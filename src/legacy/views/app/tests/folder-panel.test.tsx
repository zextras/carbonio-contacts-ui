/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, fireEvent } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { forEach, times } from 'lodash';
import { Route } from 'react-router-dom';

import { FOLDER_VIEW } from '../../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { useTagStore } from '../../../../carbonio-ui-commons/store/zustand/tags';
import {
	getAction as getActionMock,
	useAppContext
} from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import {
	makeListItemsVisible,
	screen,
	setupTest,
	triggerLoadMore,
	UserEvent,
	within
} from '../../../../carbonio-ui-commons/test/test-setup';
import {
	ActionDescriptorType,
	ACTIONS_DESCRIPTORS,
	DISPLAY_ASSERTION,
	DisplayAssertionType,
	EMPTY_LIST_HINT,
	FolderDescriptorType,
	FOLDERS_DESCRIPTORS,
	TESTID_SELECTORS
} from '../../../../constants/tests';
import {
	ContactActionRequest,
	ContactActionResponse
} from '../../../../network/api/contact-action';
import { buildContact } from '../../../../tests/model-builder';
import { registerDeleteContactHandler } from '../../../../tests/msw-handlers/delete-contact';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../../../tests/msw-handlers/find-contact-groups';
import { generateState } from '../../../../tests/state-builder';
import { createCnItem, createSoapContact } from '../../../../tests/utils';
import { generateStore } from '../../../tests/generators/store';
import { FolderPanel } from '../folder-panel';
import { createContactsApiInterceptor } from './utils';
import { CONTACT_GROUP_DELETE_ICON } from '../../../../views/contact-groups/actions/constants';

const mockMailToAction = (): void => {
	getActionMock.mockImplementation((type, id) => {
		if (type !== 'contact-list' || id !== 'mail-to') {
			return [undefined, false];
		}

		const action = {
			id: 'mail-to',
			label: 'Send Mail',
			icon: 'MailModOutline',
			execute: jest.fn()
		};

		return [action, true];
	});
};

function setupFolderPanel(folderId: string): ReturnType<typeof setupTest> {
	const store = generateStore();
	return setupTest(
		<Route path={`/folder/:folderId/:type?/:itemId?`}>
			<FolderPanel />
		</Route>,
		{
			initialEntries: [`/folder/${folderId}`],
			store
		}
	);
}

async function toggleSelectContactTypeFilter(user: UserEvent): Promise<void> {
	const selectContactsViewDropdown = await screen.findByTestId('icon: ChevronDownOutline');
	return user.click(selectContactsViewDropdown);
}

describe('Folder panel', () => {
	it('should show the empty list message if there is no contact or contact group', async () => {
		const folderId = '7';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});

		setupFolderPanel(folderId);

		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	describe('Pagination', () => {
		it('should search contacts with current filter when loading more results', async () => {
			const folderId = '7';
			const firstSearchInterceptor = createContactsApiInterceptor({
				items: [createCnItem(`First group`, [], 'special-1', folderId)],
				more: false
			});

			const { user } = setupFolderPanel(folderId);
			await firstSearchInterceptor;
			expect(await screen.findByText('First group')).toBeVisible();

			// switch filter and load groups
			const expectedQueryFilter = 'and #type:group';
			const searchGroupsInterceptor = createContactsApiInterceptor({
				items: times(100, (index) =>
					createCnItem(`Contact Group ${index}`, [], `group-${index.toString()}`, folderId)
				),
				more: true
			});
			await toggleSelectContactTypeFilter(user);
			await user.click(await screen.findByText('Contact Groups'));
			const searchGroupsRequest = await searchGroupsInterceptor;
			expect(searchGroupsRequest.query?._content).toContain(expectedQueryFilter);
			expect(await screen.findByText('Contact Group 99')).toBeVisible();

			// load more with current filter
			const loadMoreInterceptor = createContactsApiInterceptor({
				items: times(10, (index) =>
					createCnItem(
						`More Contact Group ${index}`,
						[],
						`more-group-${index.toString()}`,
						folderId
					)
				),
				more: true
			});
			await triggerLoadMore();
			const loadMoreRequest = await loadMoreInterceptor;
			expect(loadMoreRequest.query?._content).toContain(expectedQueryFilter);
			expect(await screen.findByText('More Contact Group 1')).toBeVisible();
		});
	});

	describe('contact', () => {
		it('should render the component', () => {
			const folder = FOLDERS_DESCRIPTORS.contacts;
			const contact = buildContact({ lastName: faker.string.uuid() });
			const state = generateState({
				contacts: [contact]
			});
			const store = generateStore(state);
			setupTest(
				<Route path={`/folder/:folderId/:type?/:itemId?`}>
					<FolderPanel />
				</Route>,
				{
					initialEntries: [`/folder/${folder.id}`],
					store
				}
			);
			makeListItemsVisible();
			expect(screen.getByText(contact.lastName, { exact: false })).toBeVisible();
		});

		// remove all warning as the search request is not intercepted
		// and not needed for the tests
		jest.spyOn(console, 'warn').mockImplementation();

		describe('actions', () => {
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
						const contact = buildContact({ lastName: faker.string.uuid(), parent: folder.id });
						const state = generateState({
							contacts: [contact]
						});
						const store = generateStore(state);
						const { user } = setupTest(
							<Route path={`/folder/:folderId/:type?/:itemId?`}>
								<FolderPanel />
							</Route>,
							{
								initialEntries: [`/folder/${folder.id}`],
								store
							}
						);
						makeListItemsVisible();

						const listItem = screen.getByText(contact.lastName, { exact: false });
						await act(() => user.hover(listItem));
						if (assertion.value) {
							expect(
								screen.getByRoleWithIcon('button', {
									icon: `icon: ${action.icon}`
								})
							).toBeVisible();
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
						const contact = buildContact({ lastName: faker.string.uuid(), parent: folder.id });
						const state = generateState({
							contacts: [contact]
						});
						const store = generateStore(state);
						const { user } = setupTest(
							<Route path={`/folder/:folderId/:type?/:itemId?`}>
								<FolderPanel />
							</Route>,
							{
								initialEntries: [`/folder/${folder.id}`],
								store
							}
						);
						makeListItemsVisible();

						const listItem = screen.getByText(contact.lastName, { exact: false });
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

					const contact = buildContact({
						lastName: faker.string.uuid(),
						parent: contactsFolder.id,
						tags: []
					});

					useTagStore.setState({ tags: { '1': { id: '1', name: 'testTag' } } });

					const state = generateState({
						contacts: [contact]
					});
					const store = generateStore(state);
					const { user } = setupTest(
						<Route path={`/folder/:folderId/:type?/:itemId?`}>
							<FolderPanel />
						</Route>,
						{
							initialEntries: [`/folder/${contactsFolder.id}`],
							store
						}
					);
					makeListItemsVisible();
					const contactListItem = screen.getByTestId(`contact-list-item-${contact.id}`);
					expect(contactListItem).toBeVisible();
					const contactListItemName = within(contactListItem).getByText(contact.lastName, {
						exact: false
					});
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
						_jsns: 'urn:zimbraMail',
						action: {
							op: 'tag',
							id: contact.id
						}
					});
					await user.click(tag);
					const contactActionRequest = await soapAPIInterceptor;
					expect(contactActionRequest.action).toEqual(
						expect.objectContaining({ id: contact.id, tn: 'testTag', op: 'tag' })
					);
				});
			});

			describe('Multiple selection', () => {
				it('should not display any primary action', async () => {
					useAppContext.mockReturnValue({ count: 42, setCount: jest.fn() });
					const folder = FOLDERS_DESCRIPTORS.contacts;
					const contacts = [buildContact(), buildContact()];
					const state = generateState({
						contacts
					});
					const store = generateStore(state);
					const { user } = setupTest(
						<Route path={`/folder/:folderId/:type?/:itemId?`}>
							<FolderPanel />
						</Route>,
						{
							initialEntries: [`/folder/${folder.id}`],
							store
						}
					);
					makeListItemsVisible();

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
							useAppContext.mockReturnValue({ count: 42, setCount: jest.fn() });
							const contact = buildContact({ parent: folder.id });
							const state = generateState({
								contacts: [contact]
							});
							const store = generateStore(state);
							const { user } = setupTest(
								<Route path={`/folder/:folderId/:type?/:itemId?`}>
									<FolderPanel />
								</Route>,
								{
									initialEntries: [`/folder/${folder.id}`],
									store
								}
							);
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
	describe('contact group', () => {
		describe('list item', () => {
			it('should render the avatar, the name and the number of the members (case 1+ addresses string) of a contact group', async () => {
				const contactGroupName = faker.company.name();
				const folderId = '7';
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createCnItem(
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
						createCnItem(contactGroupName, [], '1', folderId)
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
						createCnItem(contactGroupName, [faker.internet.email()], '1', folderId)
					]),
					offset: 0
				});
				setupFolderPanel(folderId);

				expect(await screen.findByText(contactGroupName)).toBeVisible();
				expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
				expect(screen.getByText('1 address')).toBeVisible();
			});
		});

		describe('hover actions', () => {
			describe('Send mail action', () => {
				it('should open the mail board when clicking the action and group has at least one member', async () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
					const contactGroupName = faker.company.name();
					const folderId = '7';
					const memberEmail = faker.internet.email();
					registerFindContactGroupsHandler({
						findContactGroupsResponse: createFindContactGroupsResponse([
							createCnItem(contactGroupName, [memberEmail], '1', folderId)
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
					const openMailComposer = jest.fn();
					const folderId = '7';
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
					const contactGroupName = faker.company.name();
					registerFindContactGroupsHandler({
						findContactGroupsResponse: createFindContactGroupsResponse([
							createCnItem(contactGroupName, [], '1', folderId)
						]),
						offset: 0
					});

					setupFolderPanel(folderId);

					await screen.findAllByText(contactGroupName);
					const mailToIcon = screen.getByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.sendEmail
					});
					expect(mailToIcon).toBeInTheDocument();
					expect(mailToIcon).toBeDisabled();
				});
			});
			describe('Delete (move to trash) contact group action', () => {
				it('should call move operation when calling the action', async () => {
					populateFoldersStore();
					const folderId = FOLDERS.CONTACTS;
					const contactGroupName = 'Group 1';
					const cnItem1 = createCnItem(contactGroupName, [], '1', folderId);
					registerFindContactGroupsHandler({
						findContactGroupsResponse: createFindContactGroupsResponse([cnItem1], false),
						offset: 0
					});
					const moveToTrashSoapInterceptor = createSoapAPIInterceptor<
						ContactActionRequest,
						ContactActionResponse
					>('ContactAction', {
						_jsns: 'urn:zimbraMail',
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
						action: {
							id: cnItem1.id,
							op: 'trash'
						}
					});
				});
				it('should restore the contact group to anotherFolder', async () => {
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
					const cnItem1 = createCnItem(contactGroupName, [], '1', folderId);
					registerFindContactGroupsHandler({
						findContactGroupsResponse: createFindContactGroupsResponse([cnItem1], false),
						offset: 0
					});
					const restoreInterceptor = createSoapAPIInterceptor<
						ContactActionRequest,
						ContactActionResponse
					>('ContactAction', {
						_jsns: 'urn:zimbraMail',
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
						jest.advanceTimersByTime(1000);
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
						action: {
							id: cnItem1.id,
							op: 'move',
							l: anotherFolder.id
						}
					});
				});
			});
			describe('Delete permanently (trash folder) contact group action', () => {
				it('should remove deleted contact group when you confirm deletion and api call will success (Hover trigger)', async () => {
					const folderId = FOLDERS.TRASH;
					const cnItem1 = createCnItem('Group 1', [], '1', folderId);
					const cnItem2 = createCnItem('Group 2', [], '2', folderId);
					const cnItem3 = createCnItem('Group 3', [], '3', folderId);
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
						`icon: ${CONTACT_GROUP_DELETE_ICON}`
					);

					await user.click(deleteAction);
					const button = await screen.findByRole('button', {
						name: 'delete'
					});
					await user.click(button);
					await screen.findByText('Contact group successfully deleted');
				});
				it('should not remove deleted contact group when you confirm deletion and api call fail (Hover trigger)', async () => {
					jest.spyOn(console, 'warn').mockImplementation();
					const folderId = FOLDERS.TRASH;
					const cnItem1 = createCnItem('Group 1', [], '11', folderId);
					const cnItem2 = createCnItem('Group 2', [], '22', folderId);
					const cnItem3 = createCnItem('Group 3', [], '33', folderId);
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
						`icon: ${CONTACT_GROUP_DELETE_ICON}`
					);

					await user.click(deleteAction);
					const modalButton = await screen.findByRole('button', {
						name: 'delete'
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
					const openMailComposer = jest.fn();
					const folderId = '7';
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
					const contactGroupName = faker.company.name();
					const contactGroupId = '1';
					const member = faker.internet.email();
					registerFindContactGroupsHandler({
						findContactGroupsResponse: createFindContactGroupsResponse([
							createCnItem(contactGroupName, [member], contactGroupId, folderId)
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

	describe('Select contact type filter', () => {
		it('should display contacts and contact groups by default', async () => {
			const contactGroupName = faker.company.name();
			const folderId = '7';
			const soapContactEmail = 'test@mycontact.com';
			const soapContact = createSoapContact({ folderId, email: soapContactEmail });
			const soapContactGroup = createCnItem(
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
			const soapContactGroup = createCnItem(
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
			const soapContactGroup = createCnItem(
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
			expect(screen.queryByText(contactGroupName)).not.toBeInTheDocument();
			expect(
				await screen.findByTestId(`contact-list-item-invisible-${soapContact.id}`)
			).toBeInTheDocument();
			makeListItemsVisible();
			expect(await screen.findByText(soapContactEmail)).toBeVisible();

			expect(contactsOnlyRequest.query?._content).toBe(`inid:"${folderId}" and not #type:group`);
		});
	});
});
