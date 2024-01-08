/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import { DLListItemWrapper } from './dl-list-item';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateDistributionList } from '../tests/utils';

describe('DL list item', () => {
	describe('actions', () => {
		it('should show send email action on hover bar', () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

			const dl = generateDistributionList();
			setupTest(<DLListItemWrapper distributionList={dl} visible />);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
			).toBeInTheDocument();
		});

		it('should show send email action on contextual menu', async () => {
			const openMailComposer = jest.fn();
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

			const dl = generateDistributionList();
			const { user } = setupTest(<DLListItemWrapper distributionList={dl} visible />);
			await user.rightClick(screen.getByText(dl.displayName));
			expect(await screen.findByText(/send email/i)).toBeVisible();
		});
	});
});
