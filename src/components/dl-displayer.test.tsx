/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { DistributionListDisplayer } from './dl-displayer';
import { OpenMailComposerIntegratedFunction } from '../actions/send-email';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	registerGetDistributionListHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { generateDistributionList } from '../tests/utils';

beforeEach(() => {
	registerGetDistributionListMembersHandler();
});

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
				await screen.findAllByText(dl.displayName);
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

	it('should render the display name', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(await screen.findAllByText(dl.displayName)).toHaveLength(2);
	});

	it('should render the email just one time if the display name is set', async () => {
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(await screen.findByText(dl.email)).toBeVisible();
	});

	it('should render the email two time if the display name is not set', async () => {
		const dl = generateDistributionList({ displayName: undefined });
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(await screen.findAllByText(dl.email)).toHaveLength(2);
	});

	it('should render the description', async () => {
		const description = faker.lorem.words();
		const dl = generateDistributionList({ description });
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(await screen.findByText(/description/i)).toBeVisible();
		expect(await screen.findByText(description)).toBeVisible();
	});

	it('should render the manager list', async () => {
		const owners = times(10, () => ({
			id: faker.string.uuid(),
			name: faker.internet.email()
		})) satisfies DistributionList['owners'];
		const dl = generateDistributionList({ owners });
		registerGetDistributionListHandler(dl);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		expect(await screen.findByText(/manager list 1/i)).toBeVisible();
		await screen.findByText(owners[0].name);
		owners.forEach((owner) => {
			expect(screen.getByText(owner.name)).toBeVisible();
		});
	});

	it('should render the member list', async () => {
		const members = times(10, () => faker.internet.email());
		const dl = generateDistributionList();
		registerGetDistributionListHandler(dl);
		registerGetDistributionListMembersHandler(members);
		setupTest(<DistributionListDisplayer id={dl.id} />);
		await screen.findByText(dl.email);
		expect(await screen.findByText(/member list 10/i)).toBeVisible();
		members.forEach((member) => {
			expect(screen.getByText(member)).toBeVisible();
		});
	});
});
