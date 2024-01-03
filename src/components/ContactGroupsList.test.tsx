/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';

import { ContactGroupsList } from './ContactGroupsList';
import { setupTest, screen } from '../carbonio-ui-commons/test/test-setup';
import { EMPTY_LIST_HINT } from '../constants/tests';

describe('Task list', () => {
	test('Show a placeholder when the list is empty', async () => {
		setupTest(<ContactGroupsList contactGroups={[]} />);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
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
		setupTest(<ContactGroupsList contactGroups={contactGroups} />);
		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});
});
