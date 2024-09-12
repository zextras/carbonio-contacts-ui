/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { EmptyDisplayer } from './empty-displayer';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../constants/tests';

describe('Empty Displayer', () => {
	it('should render empty displayer messages', () => {
		setupTest(
			<EmptyDisplayer
				title={EMPTY_DISPLAYER_HINT}
				description={'description'}
			/>
		);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(screen.getByText('description')).toBeVisible();
	});
});
