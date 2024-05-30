/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import EditViewBoardWrapper from './edit-view-board-wrapper';
import { useBoardHooks } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../tests/generators/store';
import { registerCreateContactHandler } from '../../tests/msw/create-contact';

describe('EditViewBoardWrapper', () => {
	it('should display the editor', () => {
		const store = generateStore();
		useBoardHooks.mockReturnValue({ updateBoard: jest.fn(), closeBoard: jest.fn() });
		setupTest(<EditViewBoardWrapper />, { store });
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
	});

	it('should update the board title if the user changes the title of the editor', () => {
		const store = generateStore();
		const updateBoard = jest.fn();
		const closeBoard = jest.fn();
		useBoardHooks.mockReturnValue({ updateBoard, closeBoard });
		setupTest(<EditViewBoardWrapper />, { store });
		expect(updateBoard).toHaveBeenCalledWith({ title: 'New contact' });
	});

	it('should close the board if the user successfully saves the contact', async () => {
		registerCreateContactHandler();
		const store = generateStore();
		const updateBoard = jest.fn();
		const closeBoard = jest.fn();
		useBoardHooks.mockReturnValue({ updateBoard, closeBoard });
		const { user } = setupTest(<EditViewBoardWrapper />, { store });
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
