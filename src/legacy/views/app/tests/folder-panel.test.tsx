/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';
import * as shell from '@zextras/carbonio-shell-ui';
import { forEach } from 'lodash';
import { Route } from 'react-router-dom';

import {
	getAction as getActionMock,
	useAppContext
} from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import {
	setupTest,
	screen,
	within,
	makeListItemsVisible,
	setupHook
} from '../../../../carbonio-ui-commons/test/test-setup';
import {
	ActionDescriptorType,
	ACTIONS_DESCRIPTORS,
	FolderDescriptorType,
	FOLDERS_DESCRIPTORS,
	TESTID_SELECTORS,
	DISPLAY_ASSERTION,
	DisplayAssertionType,
	EMPTY_LIST_HINT
} from '../../../../constants/tests';
import { buildContact } from '../../../../tests/model-builder';
import { registerDeleteContactHandler } from '../../../../tests/msw-handlers/delete-contact';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../../../tests/msw-handlers/find-contact-groups';
import { generateState } from '../../../../tests/state-builder';
import { createCnItem } from '../../../../tests/utils';
import { generateStore } from '../../../tests/generators/store';
import { FolderPanel } from '../folder-panel';

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

function setupFolderPanel(folderId: string): any {
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
			describe('Hover actions', () => {
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

			describe('Contextual menu actions', () => {
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

			describe('Selection', () => {
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

				describe('Secondary actions', () => {
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

		describe('Send mail action', () => {
			it('should open the mail board (ContactGroupDisplayerController trigger)', async () => {
				const openMailComposer = jest.fn();
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
				const contactGroupName = faker.company.name();
				const member = faker.internet.email();
				registerFindContactGroupsHandler({
					findContactGroupsResponse: createFindContactGroupsResponse([
						createCnItem(contactGroupName, [member])
					]),
					offset: 0
				});
				const { user } = setupFolderPanel();

				await screen.findByText(contactGroupName);
				const listItem = await screen.findByTestId(TESTID_SELECTORS.listItemContent);
				await user.click(listItem);
				const displayer = await screen.findByTestId(TESTID_SELECTORS.displayer);
				const action = within(displayer).getByRole('button', { name: /mail/i });
				await user.click(action);
				expect(openMailComposer).toHaveBeenCalledTimes(1);
				expect(openMailComposer).toHaveBeenCalledWith({
					recipients: [expect.objectContaining({ email: member })]
				});
			});

			it('should open the mail board (Hover trigger)', async () => {
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

			it('should hide send mail hover action when the contact group has 0 members', async () => {
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
				expect(screen.queryByTestId(TESTID_SELECTORS.icons.sendEmail)).not.toBeInTheDocument();
			});

			it('should open the mail board (Contextual menu trigger)', async () => {
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

		describe('Delete contact group action', () => {
			it('should remove deleted contact group when you confirm deletion and api call will success (Hover trigger)', async () => {
				const folderId = '100';
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
					TESTID_SELECTORS.icons.trash
				);

				await user.click(deleteAction);
				const button = await screen.findByRole('button', {
					name: 'delete'
				});
				await user.click(button);
				await screen.findByText('Contact group successfully deleted');

				expect(screen.queryByText(cnItem1.fileAsStr)).not.toBeInTheDocument();
			});

			it('should not remove deleted contact group when you confirm deletion and api call fail (Hover trigger)', async () => {
				jest.spyOn(console, 'warn').mockImplementation();
				const folderId = '100';
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

				const { user } = setupFolderPanel(folderId);

				await screen.findByText(cnItem1.fileAsStr);

				const listElement = screen.getByTestId(`contact-group-list-item-${cnItem1.id}`);

				expect(listElement).toBeVisible();

				const deleteAction = within(listElement as HTMLElement).getByTestId(
					TESTID_SELECTORS.icons.trash
				);

				await user.click(deleteAction);
				const button = await screen.findByRole('button', {
					name: 'delete'
				});
				await user.click(button);
				await screen.findByText('Something went wrong, please try again');

				expect(screen.getByText(cnItem1.fileAsStr)).toBeVisible();
				expect(screen.getByText(cnItem2.fileAsStr)).toBeVisible();
				expect(screen.getByText(cnItem3.fileAsStr)).toBeVisible();
			});
		});
	});
});
