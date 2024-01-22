/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { DistributionListDetails } from './dl-details';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateDistributionList } from '../tests/utils';

describe('Distribution list details', () => {
	it('should show the display name', () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDetails email={dl.email} displayName={dl.displayName} />);
		expect(screen.getByText(dl.displayName)).toBeVisible();
	});

	it('should show the email', () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDetails email={dl.email} displayName={dl.displayName} />);
		expect(screen.getByText(dl.email)).toBeVisible();
	});

	it('should show the avatar', () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDetails email={dl.email} displayName={dl.displayName} />);
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.avatar)).getByTestId(
				TESTID_SELECTORS.icons.distributionList
			)
		).toBeVisible();
	});

	it('should allow the user to copy the email', async () => {
		const dl = generateDistributionList();
		const { user } = setupTest(
			<DistributionListDetails email={dl.email} displayName={dl.displayName} />
		);
		const copyAction = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy });
		expect(copyAction).toBeVisible();
		await act(async () => {
			await user.click(copyAction);
		});
		expect(await screen.findByText(/Email copied to clipboard/i)).toBeVisible();
		expect(await window.navigator.clipboard.readText()).toEqual(dl.email);
	});

	it('should not show the description label if there is no description', () => {
		const dl = generateDistributionList();
		setupTest(
			<DistributionListDetails email={dl.email} displayName={dl.displayName} description={''} />
		);
		expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
	});

	it('should show the description if there is a description', () => {
		const description = faker.lorem.paragraph();
		const dl = generateDistributionList();
		setupTest(
			<DistributionListDetails
				email={dl.email}
				displayName={dl.displayName}
				description={description}
			/>
		);
		expect(screen.getByText(/description/i)).toBeVisible();
		expect(screen.getByText(description)).toBeVisible();
	});
});
