/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import NewContactGroupBoard from './NewContactGroupBoard';
import { screen, setup } from '../../../utils/testUtils';
import { ICON_REGEXP } from '../../constants/tests';

describe('New contact group board', () => {
	test('should show fields for group title and addresses list', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('textbox', { name: 'Group title*' })).toBeVisible();
		expect(screen.getByText('Addresses list')).toBeVisible();
		expect(
			screen.getByRole('textbox', {
				name: /Insert an address to add a new element/i
			})
		).toBeVisible();
	});

	test('should render discard and save buttons', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('button', { name: /DISCARD/i })).toBeVisible();
		expect(
			screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
		).toBeVisible();
	});

	test('should render the avatar icon, title and the number of addresses', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByTestId(ICON_REGEXP.avatar)).toBeVisible();
		expect(screen.getByText('New Group')).toBeVisible();
		expect(screen.getByText('Addresses: 0')).toBeVisible();
	});

	test('by default title input has New Group string', () => {
		setup(<NewContactGroupBoard />);
		expect(screen.getByRole('textbox', { name: 'Group title*' })).toHaveValue('New Group');
	});

	test('save button is disabled when title input is empty string', async () => {
		const { user } = setup(<NewContactGroupBoard />);
		await user.clear(screen.getByRole('textbox', { name: 'Group title*' }));
		expect(
			screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: ICON_REGEXP.save })
		).toBeDisabled();
	});

	test.todo('should render the dropdown with the proposed options once the user start typing');
});

/**
 * The discard action will reset the group to its default state.
 * Every contact group will be created in the main address book
 * Only inline contacts will be allowed
 * Every contact group must have a name in order to be created.
 * There won’t be a  minimum limit on members of a contact group
 * There won’t be a maximum limit on members of a contact group
 * Every chips will show the email inserted by the user
 * Distribution lists are valid members of a contact group and are inserted as inline value as every other member
 * The add action will be enabled only when at least one valid chip is inserted inside the Contact Input
 * [TENTATIVE] [IRIS-4906] Duplicate emails should be handled with a specific chip (as per figma) and cannot be accepted as valid values
 * When clicking on the add button only valid emails will be added in the list below, the discarded one will still be available in the contact input
 * the add button is disabled when one or more errors are present and no valid entries are provided.  Errors can be of two types and the tooltip will explain all the possible cases
 * [TENTATIVE] [IRIS-4906] When a chip is invalid because it is a duplicate and the entry of the same chip is deleted from the list below it should update and be considered valid
 * Once save is clicked and the request is done successfully the board will be closed
 * Board will close only if the response of the creation is successful
 * If an error occurs during saving request, board is kept open and an error snackbar will appear (generic error for now)
 * when user clicks on save but some valid chips are in the contact input, these chips will not be part of the creation request (first iteration)
 * The placeholder of the contact input will show a message to inform the user “add” action is required to make chip values considered when saving
 * [IRIS-4908] when user clicks on save but some valid chips are in the contact input, a message will tell the user these chips will not be part of the creation request (second iteration - still need refinement)
 */
