/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import SecondaryBarView from './SecondaryBarView';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

describe('SecondaryBar', () => {
	it('should show distribution list entry with member and manager sub-entries', async () => {
		const { user } = setupTest(<SecondaryBarView expanded />);
		const accordionItem = screen
			.getAllByTestId(TESTID_SELECTORS.accordionItem)
			.find((element) => within(element).queryByText('Distribution Lists') !== null) as HTMLElement;
		expect(accordionItem).toBeVisible();
		await user.click(
			within(accordionItem).getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.accordionExpandAction
			})
		);
		expect(screen.getByText('Member')).toBeVisible();
		expect(screen.getByText('Manager')).toBeVisible();
	});
});
