/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act } from '@testing-library/react';

import { DLDetailsInfo } from './dl-details-info';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import * as clipboard from '../carbonio-ui-commons/utils/clipboard';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateDistributionList } from '../tests/utils';

describe('Distribution list details', () => {
	it('should show the display name', () => {
		const dl = generateDistributionList();
		setupTest(<DLDetailsInfo email={dl.email} displayName={dl.displayName} />);
		expect(screen.getByText(dl.displayName)).toBeVisible();
	});

	it('should show the email', () => {
		const dl = generateDistributionList();
		setupTest(<DLDetailsInfo email={dl.email} displayName={dl.displayName} />);
		expect(screen.getByText(dl.email)).toBeVisible();
	});

	it('should show the avatar', () => {
		const dl = generateDistributionList();
		setupTest(<DLDetailsInfo email={dl.email} displayName={dl.displayName} />);
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.avatar)).getByTestId(
				TESTID_SELECTORS.icons.distributionList
			)
		).toBeVisible();
	});

	it('should allow the user to copy the email', async () => {
		const copyToClipboard = jest
			.spyOn(clipboard, 'copyToClipboard')
			.mockImplementation(() => Promise.resolve());
		const dl = generateDistributionList();
		const { user } = setupTest(<DLDetailsInfo email={dl.email} displayName={dl.displayName} />);
		const copyAction = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy });
		expect(copyAction).toBeVisible();
		await act(async () => {
			await user.click(copyAction);
		});
		expect(await screen.findByText(/Email copied to clipboard/i)).toBeVisible();
		expect(copyToClipboard).toHaveBeenCalledWith(dl.email);
	});
});
