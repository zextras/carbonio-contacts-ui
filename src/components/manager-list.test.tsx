/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import { ManagerList } from './manager-list';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

describe('Manager list', () => {
	it('should render Manager list text with the counter of managers', () => {
		setupTest(<ManagerList managers={[{ id: '1', name: 'ciao' }]} />);
		expect(screen.getByText(/manager list 1/i)).toBeVisible();
	});

	it('should render the manager list items with avatar and email', () => {
		setupTest(<ManagerList managers={[{ id: '1', name: 'email@email.com' }]} />);
		expect(screen.getByTestId(TESTID_SELECTORS.avatar)).toBeVisible();
		expect(screen.getByText('email@email.com')).toBeVisible();
	});

	it('should render the buttons on the list item', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
		setupTest(<ManagerList managers={[{ id: '1', name: 'email@email.com' }]} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
		).toBeVisible();
		expect(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy })).toBeVisible();
	});
});
