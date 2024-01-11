/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { CGDisplayerController } from './cg-displayer-controller';
import { Displayer } from './Displayer';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../constants';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../constants/tests';

describe('Displayer controller', () => {
	it('should show suggestions if no contact group is active', async () => {
		setupTest(<CGDisplayerController />);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it.todo('should show contact group details if a contact group is active');

	it('should render empty distribution list displayer suggestions', async () => {
		setupTest(
			<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
				<Displayer />
			</Route>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/`
				]
			}
		);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.distributionList)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.getByText(/Select a distribution list or contact the Admin to have one./i)
		).toBeVisible();
	});
});
