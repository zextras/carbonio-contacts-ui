/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { screen, setupTest, within } from '../../../../carbonio-ui-commons/test/test-setup';
import {
	ActionDescriptorType,
	ACTIONS_DESCRIPTORS,
	DISPLAY_ASSERTION,
	DisplayAssertionType,
	FolderDescriptorType,
	FOLDERS_DESCRIPTORS
} from '../../../../constants/tests';
import { buildContact } from '../../../../tests/model-builder';
import { generateState } from '../../../../tests/state-builder';
import { generateStore } from '../../../tests/generators/store';
import Sidebar from '../sidebar';

describe('Sidebar', () => {
	it('should render the component and display the Contacts folder', async () => {
		const state = generateState({
			folders: [
				{
					descriptor: FOLDERS_DESCRIPTORS.contacts,
					contacts: []
				}
			]
		});
		const store = generateStore(state);
		setupTest(<Sidebar expanded />, { store });
		expect(screen.getByText(FOLDERS_DESCRIPTORS.contacts.desc)).toBeVisible();
	});

	it.each`
		folder                              | action                                           | assertion
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.new}               | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.move}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.delete}            | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.edit}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.empty}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.share}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.shareInfo}         | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.emptyTrash}        | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.deletePermanently} | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.removeShare}       | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.contacts}     | ${ACTIONS_DESCRIPTORS.folders.importContacts}    | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.new}               | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.move}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.delete}            | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.edit}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.empty}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.share}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.shareInfo}         | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.emptyTrash}        | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.deletePermanently} | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.removeShare}       | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.autoContacts} | ${ACTIONS_DESCRIPTORS.folders.importContacts}    | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.new}               | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.move}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.delete}            | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.edit}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.empty}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.share}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.shareInfo}         | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.emptyTrash}        | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.deletePermanently} | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.removeShare}       | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.userDefined}  | ${ACTIONS_DESCRIPTORS.folders.importContacts}    | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.new}               | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.move}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.delete}            | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.edit}              | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.empty}             | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.share}             | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.shareInfo}         | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.emptyTrash}        | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.deletePermanently} | ${DISPLAY_ASSERTION.display}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.removeShare}       | ${DISPLAY_ASSERTION.notDisplay}
		${FOLDERS_DESCRIPTORS.trash}        | ${ACTIONS_DESCRIPTORS.folders.importContacts}    | ${DISPLAY_ASSERTION.notDisplay}
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
			const contact = buildContact();
			const state = generateState({
				folders: [
					{
						descriptor: folder,
						contacts: [contact]
					},
					// FIXME there should be at least another folder beside the trash otherwise the folder sorting algorithm breaks
					{
						descriptor: {
							id: faker.string.uuid(),
							desc: faker.word.noun()
						},
						contacts: []
					}
				]
			});
			const store = generateStore(state);
			const { user } = setupTest(<Sidebar expanded />, { store });

			const folderItem = screen.getByText(folder.desc);
			await act(() => user.rightClick(folderItem));
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
	it('should open a modal when the importContacts dropdown action is clicked', async () => {
		const contact = buildContact();
		const folder = FOLDERS_DESCRIPTORS.contacts;
		const state = generateState({
			folders: [
				{
					descriptor: folder,
					contacts: [contact]
				},
				// FIXME there should be at least another folder beside the trash otherwise the folder sorting algorithm breaks
				{
					descriptor: {
						id: faker.string.uuid(),
						desc: faker.word.noun()
					},
					contacts: []
				}
			]
		});
		const store = generateStore(state);
		const { user } = setupTest(<Sidebar expanded />, { store });

		const folderItem = screen.getByText(folder.desc);
		await act(() => user.rightClick(folderItem));
		const dropdown = await screen.findByTestId('dropdown-popper-list');

		const importContactsAction = within(dropdown).queryByText(
			ACTIONS_DESCRIPTORS.folders.importContacts.desc
		);
		expect(importContactsAction).toBeVisible();
		if (importContactsAction) await act(() => user.click(importContactsAction));
	});
});
