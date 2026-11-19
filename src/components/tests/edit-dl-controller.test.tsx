/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { vi } from 'vitest';

import { screen, setupTest, within } from '@test-setup';
import {
	EditDLControllerComponent,
	EditDLControllerComponentProps
} from 'components/edit-dl-controller';
import { PALETTE, TESTID_SELECTORS } from 'constants/tests';
import { DistributionList } from 'model/distribution-list';
import {
	generateDistributionList,
	generateDistributionListMembersPage,
	spyUseBoardHooks
} from 'tests/utils';

beforeEach(() => {
	spyUseBoardHooks();
});

const buildProps = (dl: DistributionList): EditDLControllerComponentProps => ({
	email: dl.email,
	displayName: dl.displayName,
	description: dl.description,
	members: dl.members,
	owners: dl.owners,
	loadingMembers: false,
	loadingOwners: false
});

describe('EditDLControllerComponent', () => {
	it('should show dl info header', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
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
		setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
		await screen.findByText(dl.displayName);
		expect(screen.getAllByTestId(/tab\d+/i)).toHaveLength(3);
		expect(screen.getByText('Details')).toBeVisible();
		expect(screen.getByText('Member list')).toBeVisible();
		expect(screen.getByText('Manager list')).toBeVisible();
	});

	it('should show details tab by default', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
		await screen.findByText(dl.displayName);
		expect(screen.getByRole('textbox', { name: 'Distribution List name*' })).toBeVisible();
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
				const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
				const newName = faker.string.alpha(257);
				await user.pasteInto(
					screen.getByRole('textbox', { name: /name/i }),
					newName.substring(0, 255)
				);
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName[255]);
				await screen.findByText(newName.substring(0, 256));
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName[256]);
				expect(await screen.findByText(errorMessage)).toBeVisible();
				await screen.findByText(newName);
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});

			it('should update board title when change', async () => {
				const updateBoardFn = vi.fn();
				spyUseBoardHooks(updateBoardFn);
				const dl = generateDistributionList({
					displayName: '',
					members: generateDistributionListMembersPage([])
				});
				const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
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
				const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
				const newName = faker.word.words();
				await user.type(screen.getByRole('textbox', { name: /name/i }), newName);
				expect(
					await within(screen.getByTestId(TESTID_SELECTORS.infoContainer)).findByText(newName)
				).toBeVisible();
			});
		});

		it('should not update board title when description input change', async () => {
			const updateBoardFn = vi.fn();
			spyUseBoardHooks(updateBoardFn);
			const dl = generateDistributionList({
				displayName: '',
				members: generateDistributionListMembersPage([])
			});
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await user.type(screen.getByRole('textbox', { name: /description/i }), faker.word.words());
			expect(updateBoardFn).not.toHaveBeenCalled();
		});
	});
});

describe('EditDLControllerComponent content status', () => {
	it('should be pristine when opened', async () => {
		const setContentStatus = vi.fn();
		spyUseBoardHooks(undefined, undefined, setContentStatus);
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
		await screen.findByText(dl.displayName);
		expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
		expect(setContentStatus).not.toHaveBeenCalledWith('dirty');
	});

	it('should stay pristine when the members are loaded after the board is opened', () => {
		const setContentStatus = vi.fn();
		spyUseBoardHooks(undefined, undefined, setContentStatus);
		const dl = generateDistributionList();
		const props = buildProps(dl);
		const { rerender } = setupTest(
			<EditDLControllerComponent
				{...props}
				members={generateDistributionListMembersPage()}
				loadingMembers
			/>
		);
		rerender(
			<EditDLControllerComponent
				{...props}
				members={generateDistributionListMembersPage([faker.internet.email()])}
				loadingMembers={false}
			/>
		);
		expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
		expect(setContentStatus).not.toHaveBeenCalledWith('dirty');
	});

	it('should be dirty when the description is changed and pristine when it is restored', async () => {
		const setContentStatus = vi.fn();
		spyUseBoardHooks(undefined, undefined, setContentStatus);
		const dl = generateDistributionList();
		const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
		const description = await screen.findByRole('textbox', { name: 'Description' });

		await user.type(description, 'a');
		expect(setContentStatus).toHaveBeenLastCalledWith('dirty');

		await user.type(description, '{Backspace}');
		expect(setContentStatus).toHaveBeenLastCalledWith('pristine');
	});
});
