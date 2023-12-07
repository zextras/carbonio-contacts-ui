/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { times } from 'lodash';

import { EditDLComponent, EditDLComponentProps } from './edit-dl';
import { setupTest, screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';

const buildProps = ({
	email = '',
	members = [],
	totalMembers = 0,
	onRemoveMember = jest.fn(),
	onAddMembers = jest.fn()
}: Partial<EditDLComponentProps> = {}): EditDLComponentProps => ({
	email,
	members,
	totalMembers,
	onRemoveMember,
	onAddMembers
});

describe('Edit DL Component', () => {
	it('should show email address', () => {
		const store = generateStore();
		const dlEmail = 'dl@domain.com';

		setupTest(<EditDLComponent {...buildProps({ email: dlEmail })} />, { store });
		expect(screen.getByText('Distribution list')).toBeVisible();
		expect(screen.getByText(dlEmail)).toBeVisible();
	});

	it('should show a description to let the user understand how to use the inputs', () => {
		const store = generateStore();
		const hint =
			'You can filter this list by looking for specific member’s name or add new ones by editing the Distribution List.';
		setupTest(<EditDLComponent {...buildProps()} />, { store });
		expect(screen.getByText(hint)).toBeVisible();
	});

	it('should show the input to add new elements', () => {
		const store = generateStore();
		const placeholder = 'Insert an address to add a new element';
		setupTest(<EditDLComponent {...buildProps()} />, { store });
		const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
		const contactInputTextBox = within(contactInput).getByRole('textbox', { name: placeholder });
		expect(contactInputTextBox).toBeVisible();
		const contactInputIcon = within(contactInput).getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS
		});
		expect(contactInputIcon).toBeVisible();
	});

	it('should show the input to search an address', () => {
		const store = generateStore();
		const placeholder = 'Search an address';
		setupTest(<EditDLComponent {...buildProps()} />, { store });
		const searchInput = screen.getByTestId(TESTID_SELECTORS.DL_MEMBERS_SEARCH_INPUT);
		const searchInputTextBox = within(searchInput).getByRole('textbox', { name: placeholder });
		expect(searchInputTextBox).toBeVisible();
		const searchInputIcon = within(searchInput).getByTestId(TESTID_SELECTORS.ICONS.SEARCH_MEMBERS);
		expect(searchInputIcon).toBeVisible();
	});

	it('should show the total number of members', () => {
		const store = generateStore();
		const totalMembers = 10;
		setupTest(<EditDLComponent {...buildProps({ totalMembers })} />, { store });
		expect(screen.getByText(`Member list ${totalMembers}`)).toBeVisible();
	});

	describe('Add members', () => {
		it('add action should be disabled if the input is empty', () => {
			const store = generateStore();
			setupTest(<EditDLComponent {...buildProps()} />, { store });
			const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
			const contactInputIcon = within(contactInput).getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS
			});
			expect(contactInputIcon).toBeDisabled();
		});

		it('add action should be disabled if all values are invalid', async () => {
			const store = generateStore();
			const { user } = setupTest(<EditDLComponent {...buildProps()} />, { store });
			const contactInputTextBox = screen.getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const invalidValues = ['bad', 'worst'];
			await act(async () => {
				await user.type(contactInputTextBox, invalidValues.join(','));
			});

			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
			).toBeDisabled();
		});

		it('add action should be enabled if the input contains at least a valid value', async () => {
			const store = generateStore();
			const { user } = setupTest(<EditDLComponent {...buildProps()} />, { store });
			const contactInputTextBox = screen.getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const values = ['bad', 'correct.email@domain.com', 'worst'];
			await act(async () => {
				await user.type(contactInputTextBox, values.join(','));
			});

			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS })
			).toBeEnabled();
		});

		it.todo('chip should show email if contact is added from options');

		it('chip should show email if contact is added manually by typing', async () => {
			const store = generateStore();
			const { user } = setupTest(<EditDLComponent {...buildProps()} />, { store });
			const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
			const contactInputTextBox = within(contactInput).getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const email = faker.internet.email();
			await act(async () => {
				await user.type(contactInputTextBox, `${email},`);
			});

			expect(within(contactInput).getByText(email)).toBeVisible();
			expect(contactInputTextBox).not.toHaveDisplayValue(email);
		});

		it('should call the onAddMember callback when the user clicks the add action', async () => {
			const store = generateStore();
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLComponent {...buildProps({ onAddMembers })} />, { store });
			const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
			const contactInputTextBox = within(contactInput).getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const addMembersButton = within(contactInput).getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS
			});
			await act(async () => {
				await user.type(contactInputTextBox, `${faker.internet.email()},`);
			});

			await user.click(addMembersButton);
			expect(onAddMembers).toHaveBeenCalled();
		});

		it('should call the onAddMember callback with only the valid emails', async () => {
			const store = generateStore();
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLComponent {...buildProps({ onAddMembers })} />, { store });
			const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
			const contactInputTextBox = within(contactInput).getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const addMembersButton = within(contactInput).getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS
			});
			const values = ['bad', 'correct.email@domain.com', 'worst', 'supercorrect.email@domain.net'];
			await act(async () => {
				await user.type(contactInputTextBox, values.join(','));
			});

			await user.click(addMembersButton);
			expect(onAddMembers).toHaveBeenCalledWith([
				'correct.email@domain.com',
				'supercorrect.email@domain.net'
			]);
		});

		it('should leave only invalid values inside input when user clicks on add action', async () => {
			const store = generateStore();
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLComponent {...buildProps({ onAddMembers })} />, { store });
			const contactInput = screen.getByTestId(TESTID_SELECTORS.CONTACT_INPUT);
			const contactInputTextBox = within(contactInput).getByRole('textbox', {
				name: /Insert an address to add a new element/i
			});
			const addMembersButton = within(contactInput).getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.ICONS.ADD_MEMBERS
			});
			const values = ['bad', 'correct.email@domain.com', 'worst', 'supercorrect.email@domain.net'];
			await act(async () => {
				await user.type(contactInputTextBox, values.join(','));
			});

			await user.click(addMembersButton);
			await waitFor(() => expect(onAddMembers).toHaveBeenCalled());
			await waitFor(() => expect(screen.queryByText(values[1])).not.toBeInTheDocument());
			expect(screen.getByText(values[0])).toBeVisible();
			expect(screen.getByText(values[2])).toBeVisible();
			expect(screen.queryByText(values[1])).not.toBeInTheDocument();
			expect(screen.queryByText(values[3])).not.toBeInTheDocument();
		});

		it.todo('should show a description of the error when all values are invalid');
	});

	describe('Members list', () => {
		it('should show the list of members', () => {
			const store = generateStore();
			const totalMembers = 10;
			const members: Array<string> = [];
			times(totalMembers, () => {
				members.push(faker.internet.email());
			});
			setupTest(<EditDLComponent {...buildProps({ totalMembers, members })} />, { store });
			members.forEach((member) => {
				expect(screen.getByText(member)).toBeVisible();
			});
		});

		it('should call onRemoveMember with member email if the remove action button for that member is clicked', async () => {
			const store = generateStore();
			const members: Array<string> = [];
			times(10, () => {
				members.push(faker.internet.email());
			});
			const onRemoveFn = jest.fn();
			const { user } = setupTest(
				<EditDLComponent {...buildProps({ members, onRemoveMember: onRemoveFn })} />,
				{ store }
			);
			const listItem = screen
				.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)
				.find((item) => within(item).queryByText(members[4]) !== null);
			expect(listItem).toBeDefined();
			await user.click(within(listItem as HTMLElement).getByRole('button', { name: 'remove' }));
			expect(onRemoveFn).toHaveBeenCalledWith(members[4]);
		});

		it('should show only members with a match with the search input content', async () => {
			const store = generateStore();
			const members: Array<string> = [
				'john.smith@example.org',
				'mario.rossi@test.com',
				'abraham.lincoln@president.usa',
				'bianchi@radiomaria.com',
				'do-not-reply@unknown.net'
			];
			const { user } = setupTest(<EditDLComponent {...buildProps({ members })} />, { store });
			await user.type(screen.getByRole('textbox', { name: 'Search an address' }), 'mari');
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(2)
			);
			expect(screen.getByText(members[1])).toBeVisible();
			expect(screen.getByText(members[3])).toBeVisible();
		});

		it('should show all members if the search input is cleared', async () => {
			const store = generateStore();
			const members: Array<string> = [
				'john.smith@example.org',
				'mario.rossi@test.com',
				'abraham.lincoln@president.usa',
				'bianchi@radiomaria.com',
				'do-not-reply@unknown.net'
			];
			const { user } = setupTest(<EditDLComponent {...buildProps({ members })} />, { store });
			const searchInput = screen.getByRole('textbox', { name: 'Search an address' });
			await user.type(searchInput, 'mari');
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(2)
			);
			await user.clear(searchInput);
			await waitFor(() =>
				expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(
					members.length
				)
			);
		});
	});
});
