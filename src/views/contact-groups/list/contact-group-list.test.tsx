/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';

import { ContactGroupListMainAccount } from './contact-group-list-main-account';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_LIST_HINT } from '../../../constants/tests';
import { useContactGroupStore } from '../../../store/contact-groups';

describe('Contact groups list', () => {
	test('Show a placeholder when the list is empty', async () => {
		setupTest(<ContactGroupListMainAccount />);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	test('Show list items if the list is not empty', async () => {
		const contactGroups = [
			{
				id: faker.string.uuid(),
				title: 'hello',
				members: []
			},
			{
				id: faker.string.uuid(),
				title: 'test',
				members: []
			}
		];
		useContactGroupStore.setState({ orderedContactGroups: contactGroups });
		setupTest(<ContactGroupListMainAccount />);
		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});
});
