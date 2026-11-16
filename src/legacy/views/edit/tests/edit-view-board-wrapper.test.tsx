/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import {
	closeBoard,
	setContentStatus,
	updateBoard
} from '../../../../../__mocks__/@zextras/carbonio-shell-ui';
import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { registerCreateContactHandler } from 'legacy/tests/msw/create-contact';
import EditViewBoardWrapper from 'legacy/views/edit/edit-view-board-wrapper';

describe('EditViewBoardWrapper', () => {
	it('should display the editor', () => {
		populateFoldersStore();

		setupTest(<EditViewBoardWrapper />);
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
	});

	it('should update the board title if the user changes the title of the editor', () => {
		populateFoldersStore();

		setupTest(<EditViewBoardWrapper />);
		expect(updateBoard).toHaveBeenCalledWith({ title: 'New contact' });
	});

	it('should close the board if the user successfully saves the contact', async () => {
		populateFoldersStore();
		registerCreateContactHandler();

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

	describe('content status', () => {
		beforeEach(() => {
			setContentStatus.mockClear();
		});

		it('should be pristine when the board is opened', () => {
			populateFoldersStore();

			setupTest(<EditViewBoardWrapper />);
			expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
			expect(setContentStatus).not.toHaveBeenCalledWith('dirty');
		});

		it('should be dirty when the user types a value and pristine when it is removed', async () => {
			populateFoldersStore();

			const { user } = setupTest(<EditViewBoardWrapper />);
			const inputName = screen.getByRole('textbox', { name: /first name/i });

			await user.type(inputName, 'a');
			expect(setContentStatus).toHaveBeenLastCalledWith('dirty');

			await user.clear(inputName);
			expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
		});
	});
});
