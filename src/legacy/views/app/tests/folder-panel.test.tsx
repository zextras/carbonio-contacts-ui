/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';
import { forEach } from 'lodash';
import { Route } from 'react-router-dom';

import {
	getAction as getActionMock,
	useAppContext
} from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import {
	setupTest,
	screen,
	within,
	makeListItemsVisible
} from '../../../../carbonio-ui-commons/test/test-setup';
import {
	ActionDescriptorType,
	ACTIONS_DESCRIPTORS,
	FolderDescriptorType,
	FOLDERS_DESCRIPTORS,
	TESTID_SELECTORS,
	DISPLAY_ASSERTION,
	DisplayAssertionType
} from '../../../../constants/tests';
import { buildContact } from '../../../../tests/model-builder';
import { generateState } from '../../../../tests/state-builder';
import { generateStore } from '../../../tests/generators/store';
import FolderPanel from '../folder-panel';

const mockMailToAction = (): void => {
	getActionMock.mockImplementation((type, id) => {
		if (type !== 'contact-list' || id !== 'mail-to') {
			return [undefined, false];
		}

		const action = {
			id: 'mail-to',
			label: 'Send Mail',
			icon: 'MailModOutline',
			onClick: jest.fn()
		};

		return [action, true];
	});
};

describe('Folder panel', () => {
	it('should render the component', () => {
		const folder = FOLDERS_DESCRIPTORS.contacts;
		const contact = buildContact();
		const state = generateState({
			folders: [
				{
					descriptor: folder,
					contacts: [contact]
				}
			]
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

	describe('Contacts actions', () => {
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
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
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
					mockMailToAction();
					const contact = buildContact();
					const state = generateState({
						folders: [
							{
								descriptor: folder,
								contacts: [contact]
							}
						]
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
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.mailTo}            | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.move}              | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.applyTag}          | ${DISPLAY_ASSERTION.display}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.restore}           | ${DISPLAY_ASSERTION.notDisplay}
				${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
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
					mockMailToAction();
					const contact = buildContact();
					const state = generateState({
						folders: [
							{
								descriptor: folder,
								contacts: [contact]
							}
						]
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
						expect(within(dropdown).queryByTestId(`icon: ${action.icon}`)).not.toBeInTheDocument();
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
					folders: [
						{
							descriptor: folder,
							contacts
						}
					]
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
					${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.delete}            | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.applyMultiTag}     | ${DISPLAY_ASSERTION.display}
					${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.contacts.deletePermanently} | ${DISPLAY_ASSERTION.notDisplay}
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
						useAppContext.mockReturnValue({ count: 42, setCount: jest.fn() });
						const contact = buildContact();
						const state = generateState({
							folders: [
								{
									descriptor: folder,
									contacts: [contact]
								}
							]
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
