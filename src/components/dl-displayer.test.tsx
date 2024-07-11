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
import { EDIT_DL_BOARD_ID } from '../constants';
import { TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import { generateDistributionList } from '../tests/utils';

describe('Distribution List displayer', () => {
	it('should show the display name in the title', async () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
		expect(
			await within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).findByText(dl.displayName)
		).toBeVisible();
	});

	it.each([undefined, ''])(
		'should show the email in the title if the displayName is %s',
		async (displayName) => {
			const dl = generateDistributionList({ displayName });
			setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
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
				setupTest(
					<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
				);
				expect(await screen.findByRole('button', { name: /send e-mail/i })).toBeVisible();
			});

			it('should not be visible if integration is not available', async () => {
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), false]);
				const dl = generateDistributionList();
				setupTest(
					<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
				);
				await screen.findAllByText(dl.displayName);
				expect(screen.queryByRole('button', { name: /send e-mail/i })).not.toBeInTheDocument();
			});

			it('should open the composer with the email of the distribution list set as recipient', async () => {
				const openMailComposer = jest.fn();
				jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
				const dl = generateDistributionList();
				const { user } = setupTest(
					<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
				);
				await user.click(await screen.findByRole('button', { name: /send e-mail/i }));
				expect(openMailComposer).toHaveBeenCalledWith<
					Parameters<OpenMailComposerIntegratedFunction>
				>({ recipients: [expect.objectContaining({ email: dl.email, isGroup: true })] });
			});
		});

		describe('edit', () => {
			it('should be visible if user is owner of the dl', async () => {
				const dl = generateDistributionList({ isOwner: true });
				setupTest(
					<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
				);
				expect(await screen.findByRole('button', { name: 'Edit' })).toBeVisible();
			});

			it('should not be visible if user is not owner of the dl', async () => {
				const dl = generateDistributionList({ isOwner: false });
				setupTest(
					<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
				);
				await screen.findAllByText(dl.displayName);
				expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
			});

			it('should open the board to edit the dl with the id of the distribution list', async () => {
				const addBoardFn = jest.spyOn(shell, 'addBoard');
				const members = times(10, () => faker.internet.email());
				const dl = generateDistributionList({ isOwner: true });
				const { user } = setupTest(
					<DistributionListDisplayer
						distributionList={dl}
						members={members}
						totalMembers={members.length}
					/>
				);
				await user.click(await screen.findByRole('button', { name: 'Edit' }));
				expect(addBoardFn).toHaveBeenCalledWith(
					expect.objectContaining<Partial<Parameters<typeof shell.addBoard>[0]>>({
						boardViewId: EDIT_DL_BOARD_ID,
						id: `${EDIT_DL_BOARD_ID}-${dl.id}`,
						context: { id: dl.id }
					})
				);
			});
		});
	});

	it('should render the display name', async () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
		expect(await screen.findAllByText(dl.displayName)).toHaveLength(2);
	});

	it('should render the email just one time if the display name is set', async () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
		expect(await screen.findByText(dl.email)).toBeVisible();
	});

	it('should render the email two times if the display name is not set', async () => {
		const dl = generateDistributionList({ displayName: undefined });
		setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
		expect(await screen.findAllByText(dl.email)).toHaveLength(2);
	});

	it('should show tabs for details, member list and manager list', async () => {
		const dl = generateDistributionList();
		setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
		expect(screen.getAllByTestId(/tab\d+/i)).toHaveLength(3);
		expect(screen.getByText('Details')).toBeVisible();
		expect(screen.getByText('Member list')).toBeVisible();
		expect(screen.getByText('Manager list')).toBeVisible();
	});

	describe('Details tab', () => {
		it('should not show the description label if there is no description', () => {
			const dl = generateDistributionList({ description: undefined });
			setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
			expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
		});

		it('should show a placeholder if there is no description', () => {
			const dl = generateDistributionList({ description: undefined, isOwner: false });
			setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
			expect(
				screen.getByText(
					'There are no additional details for this distribution list. For more information, ask to the administrator.'
				)
			).toBeVisible();
		});

		it('should show a placeholder specific for the owner if there is no description and the user is owner', () => {
			const dl = generateDistributionList({ description: undefined, isOwner: true });
			setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
			expect(
				screen.getByText(
					'There are no additional details for this distribution list. Edit the distribution list to add them or ask to the administrator.'
				)
			).toBeVisible();
		});

		it('should show the description if there is a description', async () => {
			const description = faker.lorem.words();
			const dl = generateDistributionList({ description });
			setupTest(<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />);
			expect(await screen.findByText(/description/i)).toBeVisible();
			expect(await screen.findByText(description)).toBeVisible();
		});
	});

	describe('Manager list tab', () => {
		it('should render the manager list', async () => {
			const owners = times(10, () => ({
				id: faker.string.uuid(),
				name: faker.internet.email()
			})) satisfies DistributionList['owners'];
			const dl = generateDistributionList({ owners });
			const { user } = setupTest(
				<DistributionListDisplayer distributionList={dl} members={[]} totalMembers={0} />
			);
			await user.click(await screen.findByText(/manager list/i));
			expect(await screen.findByText(/manager list 1/i)).toBeVisible();
			await screen.findByText(owners[0].name);
			owners.forEach((owner) => {
				expect(screen.getByText(owner.name)).toBeVisible();
			});
		});
	});

	describe('Member list tab', () => {
		it('should render the member list if user can see the members', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList();
			const { user } = setupTest(
				<DistributionListDisplayer distributionList={dl} members={members} totalMembers={10} />
			);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			expect(await screen.findByText(/member list 10/i)).toBeVisible();
			members.forEach((member) => {
				expect(screen.getByText(member)).toBeVisible();
			});
		});

		it('should render the member list tab with a placeholder if user cannot see the members', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({ canRequireMembers: false });
			const { user } = setupTest(
				<DistributionListDisplayer distributionList={dl} members={members} totalMembers={10} />
			);
			await screen.findByText(dl.email);
			expect(screen.getByText(/member list/i)).toBeVisible();
			await user.click(screen.getByText(/member list/i));
			expect(screen.queryByTestId(TESTID_SELECTORS.membersListItem)).not.toBeInTheDocument();
			expect(
				await screen.findByText(
					"You don't have the permissions to see the members of this distribution list. For more information, ask to the administrator."
				)
			).toBeVisible();
		});
	});
});
