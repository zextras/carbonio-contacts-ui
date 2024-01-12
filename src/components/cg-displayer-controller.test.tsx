/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { CGDisplayerController } from './cg-displayer-controller';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../constants/tests';
import { useContactGroupStore } from '../store/contact-groups';
import { buildContactGroup } from '../tests/model-builder';

describe('Displayer controller', () => {
	it('should show suggestions if no contact group is active', async () => {
		setupTest(<CGDisplayerController />);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it('should show contact group details if a contact group is active', () => {
		const contactGroup = buildContactGroup();
		useContactGroupStore.getState().addStoredContactGroups([contactGroup]);

		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.contactGroups}`}>
				<CGDisplayerController />
			</Route>,
			{ initialEntries: [`/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${contactGroup.id}`] }
		);

		expect(
			within(screen.getByTestId('displayer-header')).getByText(contactGroup.title)
		).toBeVisible();
	});
});
