/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';

import { MemberList } from './member-list';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

describe('Member list', () => {
	it('should render Member list text with the counter of managers', () => {
		setupTest(<MemberList members={['test']} membersCount={1} />);
		expect(screen.getByText(/member list 1/i)).toBeVisible();
		expect(
			screen.getByText(/You can filter this list by looking for specific member’s name/i)
		).toBeVisible();
	});

	it('should render the member list items with avatar and email', () => {
		setupTest(<MemberList members={['email@email.com']} membersCount={1} />);
		expect(screen.getByTestId(TESTID_SELECTORS.avatar)).toBeVisible();
		expect(screen.getByText('email@email.com')).toBeVisible();
	});

	it('should render the buttons on the list item', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
		setupTest(<MemberList members={['test']} membersCount={1} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
		).toBeVisible();
		expect(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy })).toBeVisible();
	});

	describe('Input filter', () => {
		it('should show the input to filter an address', () => {
			const placeholder = 'Filter an address';
			setupTest(<MemberList members={['test']} membersCount={1} />);
			const searchInput = screen.getByTestId(TESTID_SELECTORS.dlMembersFilterInput);
			const searchInputTextBox = within(searchInput).getByRole('textbox', { name: placeholder });
			expect(searchInputTextBox).toBeVisible();
			const searchInputIcon = within(searchInput).getByTestId(TESTID_SELECTORS.icons.filterMembers);
			expect(searchInputIcon).toBeVisible();
		});

		it('should show only members with a match with the search input content', async () => {
			const members: Array<string> = [
				'john.smith@example.org',
				'mario.rossi@test.com',
				'abraham.lincoln@president.usa',
				'bianchi@radiomaria.com',
				'do-not-reply@unknown.net'
			];
			const { user } = setupTest(<MemberList members={members} membersCount={1} />);
			await user.type(screen.getByRole('textbox', { name: 'Filter an address' }), 'mari');
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(2)
			);
			expect(screen.getByText(members[1])).toBeVisible();
			expect(screen.getByText(members[3])).toBeVisible();
		});

		it('should show all members if the search input is cleared', async () => {
			const members: Array<string> = [
				'john.smith@example.org',
				'mario.rossi@test.com',
				'abraham.lincoln@president.usa',
				'bianchi@radiomaria.com',
				'do-not-reply@unknown.net'
			];
			const { user } = setupTest(<MemberList members={members} membersCount={1} />);
			const searchInput = screen.getByRole('textbox', { name: 'Filter an address' });
			await user.type(searchInput, 'mari');
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(2)
			);
			await user.clear(searchInput);
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(members.length)
			);
		});
	});

	it('should show 3 shimmed items while loading', () => {
		setupTest(<MemberList members={['member 1']} membersCount={0} loading />);
		expect(screen.queryByText('member 1')).not.toBeInTheDocument();
		const shimmedItems = screen.getAllByTestId(TESTID_SELECTORS.shimmedListItem);
		expect(shimmedItems).toHaveLength(3);
		expect(shimmedItems[0]).toBeVisible();
	});
});
