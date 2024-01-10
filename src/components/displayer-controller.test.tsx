/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { DisplayerController } from './displayer-controller';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../constants/tests';

describe('Displayer controller', () => {
	it('should show suggestions if no contact group is active', async () => {
		setupTest(<DisplayerController />);
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it.todo('should show contact group details if a contact group is active');
});
