/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';
import 'jest-styled-components';

import { EditDLControllerComponent } from './edit-dl-controller';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { PALETTE, TESTID_SELECTORS } from '../constants/tests';
import { DistributionListOwner } from '../model/distribution-list';
import { registerGetDistributionListHandler } from '../tests/msw-handlers/get-distribution-list';
import { registerGetDistributionListMembersHandler } from '../tests/msw-handlers/get-distribution-list-members';
import {
	generateDistributionList,
	generateDistributionListMembersPage,
	spyUseBoardHooks
} from '../tests/utils';

beforeEach(() => {
	registerGetDistributionListMembersHandler([]);
	spyUseBoardHooks();
});

describe('EditDLControllerComponent', () => {
	it('should show dl info header', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent distributionList={dl} />);
		const contentHeader = screen.getByTestId(TESTID_SELECTORS.infoContainer);
		expect(await within(contentHeader).findByText(dl.displayName)).toBeVisible();
		expect(await within(contentHeader).findByText(dl.email)).toBeVisible();
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.avatar)).getByTestId(
				TESTID_SELECTORS.icons.distributionList
			)
		).toBeVisible();
	});

	it('should show tabs for details, member list and manager list', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent distributionList={dl} />);
		await screen.findByText(dl.displayName);
		expect(screen.getAllByTestId(/tab\d+/i)).toHaveLength(3);
		expect(screen.getByText('Details')).toBeVisible();
		expect(screen.getByText('Member list')).toBeVisible();
		expect(screen.getByText('Manager list')).toBeVisible();
	});

	it('should show details tab by default', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent distributionList={dl} />);
		await screen.findByText(dl.displayName);
		expect(screen.getByRole('textbox', { name: 'Distribution List name' })).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible();
		expect(screen.queryByText(/member list \d+/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/manager list \d+/i)).not.toBeInTheDocument();
	});

	describe('Details tab', () => {
		describe('display name input', () => {
			it('should show error if length is greater than 256 chars', async () => {
				const dl = generateDistributionList({
					displayName: '',
					members: generateDistributionListMembersPage([])
				});
				const errorMessage = 'Maximum length allowed is 256 characters';
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				const newName = faker.string.alpha(257);
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName.substring(0, 256));
				await screen.findByText(newName.substring(0, 256));
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName[256]);
				expect(await screen.findByText(errorMessage)).toBeVisible();
				await screen.findByText(newName);
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});

			it('should update board title when change', async () => {
				const updateBoardFn = jest.fn();
				spyUseBoardHooks(updateBoardFn);
				const dl = generateDistributionList({
					displayName: '',
					members: generateDistributionListMembersPage([])
				});
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				const newName = faker.word.words();
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName);
				expect(updateBoardFn).toHaveBeenCalledWith<
					Parameters<ReturnType<typeof useBoardHooks>['updateBoard']>
				>({ title: newName });
			});

			it('should update info panel when change', async () => {
				const dl = generateDistributionList({
					displayName: '',
					members: generateDistributionListMembersPage([])
				});
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				const newName = faker.word.words();
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName);
				expect(
					await within(screen.getByTestId(TESTID_SELECTORS.infoContainer)).findByText(newName)
				).toBeVisible();
			});
		});

		it('should not update board title when description input change', async () => {
			const updateBoardFn = jest.fn();
			spyUseBoardHooks(updateBoardFn);
			const dl = generateDistributionList({
				displayName: '',
				members: generateDistributionListMembersPage([])
			});
			const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
			await user.type(screen.getByRole('textbox', { name: /description/i }), faker.word.words());
			expect(updateBoardFn).not.toHaveBeenCalled();
		});
	});

	describe('Managers tab', () => {
		it('should retrieve managers from network only once', async () => {
			const owners = times<DistributionListOwner>(10, () => ({
				id: faker.string.uuid(),
				name: faker.internet.email()
			}));
			const dl = generateDistributionList({ owners: undefined });
			const getDLHandler = registerGetDistributionListHandler({ ...dl, owners });
			const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
			await screen.findByText(dl.displayName);
			await user.click(screen.getByText(/manager list/i));
			await screen.findByText(/manager list 0/i);
			await screen.findByText(owners[0].name);
			expect(getDLHandler).toHaveBeenCalledTimes(1);
			await user.click(screen.getByText(/details/i));
			await screen.findByRole('textbox', { name: /name/i });
			await user.click(screen.getByText(/manager list/i));
			await screen.findByText(owners[0].name);
			expect(getDLHandler).toHaveBeenCalledTimes(1);
		});

		it('should not retrieve managers from network if they are provided as props', async () => {
			const owners = times<DistributionListOwner>(10, () => ({
				id: faker.string.uuid(),
				name: faker.internet.email()
			}));
			const dl = generateDistributionList({ owners });
			const getDLHandler = registerGetDistributionListHandler({ ...dl, owners });
			const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
			await screen.findByText(dl.displayName);
			await user.click(screen.getByText(/manager list/i));
			await screen.findByText(owners[0].name);
			expect(getDLHandler).not.toHaveBeenCalled();
		});
	});
});
