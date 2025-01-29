/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';

import { ContactGroupList } from './contact-groups-list';
import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_LIST_HINT } from '../../../constants/tests';
import { useContactGroupStore } from '../../../store/contact-groups';

describe('Contact groups list', () => {
	beforeEach(() => {
		createSoapAPIInterceptor('Search', {});
	});
	test('Show a placeholder when the list is empty', async () => {
		setupTest(<ContactGroupList />);
		expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
	});

	test('Show list items if the list is not empty', async () => {
		const contactGroups = [
			{
				id: faker.string.uuid(),
				folderId: '7',
				title: 'hello',
				members: []
			},
			{
				id: faker.string.uuid(),
				folderId: '7',
				title: 'test',
				members: []
			}
		];
		useContactGroupStore.setState({ contactGroups });
		setupTest(<ContactGroupList />);
		expect(screen.getByText('hello')).toBeVisible();
		expect(screen.getByText('test')).toBeVisible();
	});
});
