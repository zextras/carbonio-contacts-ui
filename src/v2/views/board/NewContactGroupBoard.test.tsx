/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import NewContactGroupBoard from './NewContactGroupBoard';
import { screen, setup } from '../../../utils/testUtils';

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
			screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: 'icon: SaveOutline' })
		).toBeVisible();
	});
});
