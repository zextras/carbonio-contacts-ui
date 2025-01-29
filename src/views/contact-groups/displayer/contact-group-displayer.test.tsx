/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { ContactGroupDisplayer } from './contact-group-displayer';
import { screen, setupTest, within } from '../../../carbonio-ui-commons/test/test-setup';
import { ROUTES } from '../../../constants';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../../../constants/tests';
import { useContactGroupStore } from '../../../store/contact-groups';
import { buildContactGroup } from '../../../tests/model-builder';
import { CONTACT_GROUPS_PATH } from '../navigation';

describe('Displayer controller', () => {
	it('should show empty displayer if no contact group is active', async () => {
		setupTest(<ContactGroupDisplayer />, {
			initialEntries: ['/contact-groups/7']
		});
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it('should show contact group details if a contact group is active', () => {
		const contactGroup = buildContactGroup();
		useContactGroupStore.getState().addContactGroups([contactGroup]);

		setupTest(
			<Route path={`${ROUTES.mainRoute}/${CONTACT_GROUPS_PATH}/7/:id?`}>
				<ContactGroupDisplayer />
			</Route>,
			{ initialEntries: [`/${CONTACT_GROUPS_PATH}/7/${contactGroup.id}`] }
		);

		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(contactGroup.title)
		).toBeVisible();
	});
});
