/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { DLListItem } from './dl-list-item';
import { OpenMailComposerIntegratedFunction } from '../actions/send-email';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { EDIT_DL_BOARD_ID } from '../constants';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateDistributionList } from '../tests/utils';

describe('DL list item', () => {
	it('should show avatar', () => {
		const dl = generateDistributionList();
		setupTest(<DLListItem distributionList={dl} visible />);
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.avatar)).getByTestId(
				TESTID_SELECTORS.icons.distributionList
			)
		).toBeVisible();
	});

	it('should show the display name', () => {
		const dl = generateDistributionList({ displayName: faker.internet.displayName() });
		setupTest(<DLListItem distributionList={dl} visible />);
		expect(screen.getByText(dl.displayName)).toBeVisible();
		expect(screen.queryByText(dl.email)).not.toBeInTheDocument();
	});

	it.each([undefined, ''])(
		'should show the email if the displayName is %s',
		async (displayName) => {
			const dl = generateDistributionList({ displayName });
			setupTest(<DLListItem distributionList={dl} visible />);
			expect(screen.getByText(dl.email)).toBeVisible();
		}
	);

	describe('actions', () => {
		describe('send email', () => {
			describe('on hover bar', () => {
				it('should be visible if integration is available', () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

					const dl = generateDistributionList();
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
					).toBeInTheDocument();
				});

				it('should not be visible if integration is not available', () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, false]);

					const dl = generateDistributionList();
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
					).not.toBeInTheDocument();
				});

				it('should open the composer with the email of the distribution list set as recipient', async () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

					const dl = generateDistributionList();
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
					);
					expect(openMailComposer).toHaveBeenCalledWith<
						Parameters<OpenMailComposerIntegratedFunction>
					>({ recipients: [{ email: dl.email, isGroup: true }] });
				});
			});

			describe('on contextual menu', () => {
				it('should be visible on contextual menu', async () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

					const dl = generateDistributionList();
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					expect(await screen.findByText(/send e-mail/i)).toBeVisible();
				});

				it('should not be visible on contextual menu if integration is not available', async () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, false]);

					const dl = generateDistributionList();
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					await screen.findByTestId(TESTID_SELECTORS.dropdownList);
					expect(screen.queryByText(/send e-mail/i)).not.toBeInTheDocument();
				});

				it('should open the composer with the email of the distribution list set as recipient', async () => {
					const openMailComposer = jest.fn();
					jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);

					const dl = generateDistributionList();
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					await user.click(await screen.findByText(/send e-mail/i));
					expect(openMailComposer).toHaveBeenCalledWith<
						Parameters<OpenMailComposerIntegratedFunction>
					>({ recipients: [{ email: dl.email, isGroup: true }] });
				});
			});
		});

		describe('edit', () => {
			describe('on hover bar', () => {
				it('should be visible if user is owner', () => {
					const dl = generateDistributionList({ isOwner: true });
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
					).toBeInTheDocument();
				});

				it('should not be visible if user is not owner', () => {
					const dl = generateDistributionList({ isOwner: false });
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
					).not.toBeInTheDocument();
				});

				it('should open the board to edit the dl', async () => {
					const addBoardFn = jest.spyOn(shell, 'addBoard');
					const dl = generateDistributionList({ isOwner: true });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
					);
					expect(addBoardFn).toHaveBeenCalledWith(
						expect.objectContaining<Partial<Parameters<typeof shell.addBoard>[0]>>({
							url: EDIT_DL_BOARD_ID,
							context: dl
						})
					);
				});
			});

			describe('on contextual menu', () => {
				it('should be visible if user is owner', async () => {
					const dl = generateDistributionList({ isOwner: true });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					expect(await screen.findByText('Edit')).toBeVisible();
				});

				it('should not be visible if user is not owner', async () => {
					const dl = generateDistributionList({ isOwner: false });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					await screen.findByTestId(TESTID_SELECTORS.dropdownList);
					expect(screen.queryByText('Edit')).not.toBeInTheDocument();
				});

				it('should open the board to edit the dl', async () => {
					const addBoardFn = jest.spyOn(shell, 'addBoard');
					const dl = generateDistributionList({ isOwner: true });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					await user.click(await screen.findByText('Edit'));
					expect(addBoardFn).toHaveBeenCalledWith(
						expect.objectContaining<Partial<Parameters<typeof shell.addBoard>[0]>>({
							url: EDIT_DL_BOARD_ID,
							context: dl
						})
					);
				});
			});
		});

		describe('edit', () => {
			describe('on hover bar', () => {
				it('should be visible if user is owner', () => {
					const dl = generateDistributionList({ isOwner: true });
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
					).toBeInTheDocument();
				});

				it('should not be visible if user is not owner', () => {
					const dl = generateDistributionList({ isOwner: false });
					setupTest(<DLListItem distributionList={dl} visible />);
					expect(
						screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.editDL })
					).not.toBeInTheDocument();
				});
			});

			describe('on contextual menu', () => {
				it('should be visible on contextual menu if user is owner', async () => {
					const dl = generateDistributionList({ isOwner: true });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					expect(await screen.findByText('Edit')).toBeVisible();
				});

				it('should not be visible on contextual menu if user is not owner', async () => {
					const dl = generateDistributionList({ isOwner: false });
					const { user } = setupTest(<DLListItem distributionList={dl} visible />);
					await user.rightClick(screen.getByText(dl.displayName));
					await screen.findByTestId(TESTID_SELECTORS.dropdownList);
					expect(screen.queryByText('Edit')).not.toBeInTheDocument();
				});
			});
		});
	});
});
