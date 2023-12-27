/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';

import { ContactGroupsList } from './ContactGroupsList';
import { screen, setup } from '../../utils/testUtils';

describe('Task list', () => {
	test('Show a placeholder when the list is empty', async () => {
		setup(<ContactGroupsList contactGroups={[]} />);
		expect(await screen.findByText('emptyListPlaceholder')).toBeVisible();
	});

	test('Show list items if the list is not empty', async () => {
		const contactGroups = [
			{
				id: faker.string.alpha(),
				title: 'hello',
				members: []
			},
			{
				id: faker.string.alpha(),
				title: 'test',
				members: []
			}
		];
		setup(<ContactGroupsList contactGroups={contactGroups} />);
		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});
});
