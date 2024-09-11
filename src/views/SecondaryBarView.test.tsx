/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import 'jest-styled-components';

import SecondaryBarView from './SecondaryBarView';
import {screen, setupTest, within} from '../carbonio-ui-commons/test/test-setup';
import {TESTID_SELECTORS} from '../constants/tests';

// function spyUseNavigation(navigateTo: jest.Mock): void {
// 	jest.spyOn(useNavigationHook, 'useNavigation').mockReturnValue({
// 		navigateTo
// 	});
// }

describe('SecondaryBar', () => {
	it('should not show contact groups entry', () => {
		setupTest(<SecondaryBarView expanded />);
		expect(screen.queryByText('My Contact Groups')).not.toBeInTheDocument();
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

	it('should show distribution list entry with member and manager sub-entries', async () => {
		setupTest(<SecondaryBarView expanded />);
		const accordionItem = screen
			.getAllByTestId(TESTID_SELECTORS.accordionItem)
			.find((element) => within(element).queryByText('Distribution Lists') !== null) as HTMLElement;
		expect(accordionItem).toBeVisible();
		expect(screen.getByText('Member')).toBeVisible();
		expect(screen.getByText('Manager')).toBeVisible();
	});

	it.todo('should highlight the selected distribution list entry');

	it.todo('should highlight contact groups');
});
