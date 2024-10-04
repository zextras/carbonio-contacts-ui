/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { times } from 'lodash';

import { EditDLControllerComponent, EditDLControllerComponentProps } from './edit-dl-controller';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import {
	generateDistributionList,
	generateDistributionListMembersPage,
	getDLContactInput,
	spyUseBoardHooks
} from '../tests/utils';

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
	describe('Members tab', () => {
		it('should render the component when the member field of the response is undefined', async () => {
			const dl = generateDistributionList();
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			expect(await screen.findByText(dl.email)).toBeVisible();
			await user.click(screen.getByText(/member list/i));
			expect(await screen.findByText('Member list 0')).toBeVisible();
		});

		it('should add all valid emails inside the list when user clicks on add action', async () => {
			const dl = generateDistributionList();
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			const emails = ['john.doe@test.com', 'invalid-email.com', 'mary.white@example.org'];
			await user.click(screen.getByText(/member list/i));
			await screen.findByText(/member list 0/i);
			await user.type(screen.getByRole('textbox', { name: /type an address/i }), emails.join(','));
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			const memberElements = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			expect(memberElements).toHaveLength(2);
			expect(screen.getByText(emails[0])).toBeVisible();
			expect(screen.getByText(emails[2])).toBeVisible();
		});

		it('should add new members on top of the list of members', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members)
			});

			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			const emails = ['john.doe@test.com', 'mary.white@example.org'];
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			await act(async () => {
				await user.type(
					screen.getByRole('textbox', { name: /type an address/i }),
					emails.join(',')
				);
			});
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			const memberElements = screen.getAllByTestId(TESTID_SELECTORS.membersListItem);
			expect(memberElements).toHaveLength(12);
			expect(within(memberElements[0]).getByText(emails[0])).toBeVisible();
			expect(within(memberElements[1]).getByText(emails[1])).toBeVisible();
			expect(within(memberElements[2]).getByText(members[0])).toBeVisible();
		});

		it('should remove a member from the members list when the user clicks on the remove button', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members)
			});

			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			const memberToRemoveElement = membersListItems.find(
				(element) => within(element).queryByText(members[4]) !== null
			) as HTMLElement;
			await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
			expect(screen.queryByText(members[4])).not.toBeInTheDocument();
		});

		it('should increase the member list counter when a new member is added', async () => {
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage([
					faker.internet.email(),
					faker.internet.email(),
					faker.internet.email()
				])
			});
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			const newMember = 'newmember@example.com';
			await user.type(screen.getByRole('textbox', { name: /type an address/i }), newMember);
			await user.click(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			);
			expect(screen.getByText(/member list 4/i)).toBeVisible();
		});

		it('should decrease the member list counter when a member is removed', async () => {
			const members = [faker.internet.email(), faker.internet.email(), faker.internet.email()];
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members)
			});
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			const memberToRemoveElement = membersListItems.find(
				(element) => within(element).queryByText(members[1]) !== null
			) as HTMLElement;
			await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
			expect(screen.getByText(/member list 2/i)).toBeVisible();
		});

		it('should remove duplicated icon from chip when member is removed from the members list', async () => {
			const duplicatedEmail = faker.internet.email();
			const members = [duplicatedEmail, faker.internet.email(), faker.internet.email()];
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members)
			});
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			await act(async () => {
				await user.type(getDLContactInput().textbox, `${duplicatedEmail},`);
			});
			expect(screen.getByTestId(TESTID_SELECTORS.icons.duplicatedMember)).toBeVisible();
			const memberToRemoveElement = membersListItems.find(
				(element) => within(element).queryByText(duplicatedEmail) !== null
			) as HTMLElement;
			await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
			await waitFor(() => expect(memberToRemoveElement).not.toBeInTheDocument());
			await waitFor(() =>
				expect(
					screen.queryByTestId(TESTID_SELECTORS.icons.duplicatedMember)
				).not.toBeInTheDocument()
			);
		});

		it('should remove the duplication error message under the contact input when member is removed from the members list', async () => {
			const duplicatedEmail = faker.internet.email();
			const members = [duplicatedEmail];
			const dl = generateDistributionList({
				members: generateDistributionListMembersPage(members)
			});
			const errorMessage = 'Address already present';
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
			await act(async () => {
				await user.type(getDLContactInput().textbox, `${duplicatedEmail},`);
			});
			const memberToRemoveElement = membersListItems.find(
				(element) => within(element).queryByText(duplicatedEmail) !== null
			) as HTMLElement;
			await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
			await waitFor(() => expect(memberToRemoveElement).not.toBeInTheDocument());
			await waitFor(() => expect(screen.queryByText(errorMessage)).not.toBeInTheDocument());
		});
	});
});
