/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';
import { rest } from 'msw';

import { EditDLControllerComponent } from './edit-dl-controller';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import { setupTest, screen } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';

describe('EditDLControllerComponent', () => {
	it('should render an EditDLComponent that displays the DL email', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const store = generateStore();
		setupTest(<EditDLControllerComponent email={dlEmail} />, { store });
		expect(screen.getByText(dlEmail)).toBeVisible();
	});

	it('should load all members on first load', async () => {
		const store = generateStore();
		const dlEmail = 'dl-mail@domain.net';
		const members: Array<string> = [];
		times(10, () => members.push(faker.internet.email()));
		getSetupServer().use(
			rest.post('/service/soap/GetDistributionListMembersRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Body: {
							GetDistributionListMembersResponseResponse: {
								dlm: members.map((member) => ({ _content: member })),
								more: false,
								total: members.length,
								_jsns: 'urn:zimbraAccount'
							}
						}
					})
				)
			)
		);

		setupTest(<EditDLControllerComponent email={dlEmail} />, { store });
		expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(members.length);
	});

	it.todo('should add all valid emails inside the list when user clicks on add action');
	it.todo('should leave only invalid values inside input when user clicks on add action');
	it.todo('should remove a member from the members list when the user clicks on the remove button');

	describe('Modal footer', () => {
		describe('Cancel action button', () => {
			it.todo('should be visible and enabled');
			it.todo('should close the modal when clicked');
		});
		describe('Save action button', () => {
			it.todo('should be visible');
			it.todo('should be disabled if there are no changes');
			it.todo('should show a tooltip if disabled');
			it.todo('should be enabled if there is the user does some change');
			it.todo('should call the API when clicked');
			it.todo('should cause a success snackbar to appear when then API return a success result');
			it.todo('should cause a error snackbar to appear when then API return an error result');
		});
	});
});
