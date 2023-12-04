/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { EditDLComponent, EditDLComponentProps } from './edit-dl';
import { setupTest, screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';

const buildProps = ({
	email = '',
	members = [],
	totalMembers = 0
}: Partial<EditDLComponentProps> = {}): EditDLComponentProps => ({
	email,
	members,
	totalMembers
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

		it.todo('should remove a member if the remove action button for that member is clicked');
	});
	describe('Modal footer', () => {
		describe('Cancel action button', () => {
			it.todo('should be visible and enabled');
			it.todo('should close the modal when clicked');
		});
		describe('Save action button', () => {
			it.todo('should be visible');
			it.todo('should be disabled if there are no changes');
			it.todo('should show a tooltip if disabled');
			it.todo('should be enabled if there is the user does some change');
			it.todo('should cause a success snackbar to appear when clicked');
		});
	});
});
