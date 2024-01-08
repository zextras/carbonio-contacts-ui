/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import { DistributionListDisplayer } from './dl-displayer';
import { OpenMailComposerIntegratedFunction } from '../actions/send-email';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { registerGetDistributionListHandler } from '../tests/msw-handlers';
import { generateDistributionList } from '../tests/utils';

describe('Distribution List displayer', () => {
	it('should show the display name in the title', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(
			await within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).findByText(dl.displayName)
		).toBeVisible();
	});

	it.each([undefined, ''])(
		'should show the email in the title if the displayName is %s',
		async (displayName) => {
			const dl = generateDistributionList({ displayName });
			registerGetDistributionListHandler(dl);
			setupTest(<DistributionListDisplayer id={dl.id} />);
			expect(
				await within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).findByText(dl.email)
			).toBeVisible();
		}
	);

	describe('actions', () => {
		describe('send email', () => {
			it('should be visible if integration is available', async () => {
				const openMailComposer = jest.fn();
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
				const dl = generateDistributionList();
				registerGetDistributionListHandler(dl);
				setupTest(<DistributionListDisplayer id={dl.id} />);
				expect(await screen.findByText(/send e-mail/i)).toBeVisible();
			});

			it('should not be visible if integration is not available', async () => {
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), false]);
				const dl = generateDistributionList();
				registerGetDistributionListHandler(dl);
				setupTest(<DistributionListDisplayer id={dl.id} />);
				await screen.findByText(dl.displayName);
				expect(screen.queryByText(/send e-mail/i)).not.toBeInTheDocument();
			});

			it('should open the composer with the email of the distribution list set as recipient', async () => {
				const openMailComposer = jest.fn();
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
				const dl = generateDistributionList();
				registerGetDistributionListHandler(dl);
				const { user } = setupTest(<DistributionListDisplayer id={dl.id} />);
				await user.click(await screen.findByText(/send e-mail/i));
				expect(openMailComposer).toHaveBeenCalledWith<
					Parameters<OpenMailComposerIntegratedFunction>
				>({ recipients: [{ email: dl.email }] });
			});
		});
	});
});
