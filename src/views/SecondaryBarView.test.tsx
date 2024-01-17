/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import SecondaryBarView from './SecondaryBarView';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';

// function spyUseNavigation(navigateTo: jest.Mock): void {
// 	jest.spyOn(useNavigationHook, 'useNavigation').mockReturnValue({
// 		navigateTo
// 	});
// }

describe('SecondaryBar', () => {
	it('should show contact groups entry', () => {
		setupTest(<SecondaryBarView expanded />);
		expect(screen.getByText('My Contact Groups')).toBeVisible();
	});

	// TODO: click on secondary bar throws an error on pointer-events,
	//  I don't know why, need some time to investigate
	it.todo(
		'should navigate to contact groups route on click on contact groups entry' /* , async () => {
		const navigateToFn = jest.fn();
		spyUseNavigation(navigateToFn);
		const { user } = setupTest(<SecondaryBarView expanded />);
		await user.click(screen.getByText('My Contact Groups'));
		expect(navigateToFn).toHaveBeenCalledWith('/contact-groups');
	} */
	);
});
