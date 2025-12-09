/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, setupTest } from '@test-setup';
import { EmptyDisplayer } from 'components/empty-displayer';
import { EMPTY_DISPLAYER_NO_CONTACTS_HINT, TESTID_SELECTORS } from 'constants/tests';

describe('Empty Displayer', () => {
	it('should render empty displayer messages', () => {
		setupTest(
			<EmptyDisplayer
				icon={'DistributionListOutline'}
				title={EMPTY_DISPLAYER_NO_CONTACTS_HINT}
				description={'description'}
			/>
		);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.distributionList)).toBeVisible();
		expect(screen.getByText(EMPTY_DISPLAYER_NO_CONTACTS_HINT)).toBeVisible();
		expect(screen.getByText('description')).toBeVisible();
	});
});
