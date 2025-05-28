/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import EditViewBoardWrapper from './edit-view-board-wrapper';
import { useBoardHooks } from '@zextras/carbonio-ui-commons';
import { populateFoldersStore } from '@zextras/carbonio-ui-commons';
import { screen, setupTest } from '@zextras/carbonio-ui-commons';
import { registerCreateContactHandler } from '../../tests/msw/create-contact';

describe('EditViewBoardWrapper', () => {
	it('should display the editor', () => {
		populateFoldersStore();

		useBoardHooks.mockReturnValue({ updateBoard: jest.fn(), closeBoard: jest.fn() });
		setupTest(<EditViewBoardWrapper />);
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
	});

	it('should update the board title if the user changes the title of the editor', () => {
		populateFoldersStore();

		const updateBoard = jest.fn();
		const closeBoard = jest.fn();
		useBoardHooks.mockReturnValue({ updateBoard, closeBoard });
		setupTest(<EditViewBoardWrapper />);
		expect(updateBoard).toHaveBeenCalledWith({ title: 'New contact' });
	});

	it('should close the board if the user successfully saves the contact', async () => {
		populateFoldersStore();
		registerCreateContactHandler();

		const updateBoard = jest.fn();
		const closeBoard = jest.fn();
		useBoardHooks.mockReturnValue({ updateBoard, closeBoard });
		const { user } = setupTest(<EditViewBoardWrapper />);
		const newName = faker.person.firstName();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(inputName).toBeVisible();
		await user.type(inputName, newName);
		await user.click(saveButton);
		await screen.findByText(/new contact created/i);
		expect(closeBoard).toHaveBeenCalled();
	});
});
