/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { ContactGroupDisplayerShared } from './contact-group-displayer-shared';
import { screen, setupTest, within } from '../../../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../../../constants/tests';
import { useContactGroupStore } from '../../../store/contact-groups';
import { buildContactGroup } from '../../../tests/model-builder';

describe('Shared account displayer', () => {
	it('should show empty displayer if no contact group is active', async () => {
		const accountId = '123';
		setupTest(<ContactGroupDisplayerShared />, {
			initialEntries: [`/contact-groups/${accountId}`]
		});
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
	});

	it('should show contact group details if a contact group is active', () => {
		const accountId = '456';
		const contactGroup = buildContactGroup();
		useContactGroupStore
			.getState()
			.populateSharedContactGroupsByAccountId(accountId, [contactGroup], 0, false);

		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.contactGroups}/:accountId/:id`}>
				<ContactGroupDisplayerShared />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${accountId}/${contactGroup.id}`
				]
			}
		);

		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(contactGroup.title)
		).toBeVisible();
	});
});
