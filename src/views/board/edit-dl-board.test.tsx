/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import EditDLBoard from './edit-dl-board';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { generateDistributionList, spyUseBoardHooks } from '../../tests/utils';

beforeEach(() => {
	spyUseBoardHooks();
});

describe('Edit DL board', () => {
	it('should show the distribution list edit view', async () => {
		const dl = generateDistributionList();
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: dl,
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(screen.getByText(/details/i)).toBeVisible();
		expect(screen.getByText(/member list/i)).toBeVisible();
		expect(screen.getByText(/manager list/i)).toBeVisible();
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /discard/i })).toBeVisible();
	});

	it('should show an error message if board is opened without a distribution list', () => {
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: undefined,
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});
		setupTest(<EditDLBoard />);
		expect(screen.getByText(/something went wrong/i)).toBeVisible();
	});

	describe('Details tab', () => {
		it('should show dl data inside input fields', async () => {
			const description = faker.word.words();
			const dl = generateDistributionList({ description });
			jest.spyOn(shell, 'useBoard').mockReturnValue({
				context: dl,
				id: '',
				url: '',
				app: '',
				icon: '',
				title: ''
			});
			setupTest(<EditDLBoard />);
			await screen.findByText(dl.displayName);
			expect(screen.getByRole('textbox', { name: 'Distribution List name' })).toHaveValue(
				dl.displayName
			);
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(description);
		});
	});
});
