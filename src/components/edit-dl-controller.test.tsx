/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { times } from 'lodash';

import {
	EditDLControllerComponent,
	EditDLControllerComponentProps,
	getMembersPartition
} from './edit-dl-controller';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../constants/tests';
import {
	registerDistributionListActionHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { getDLContactInput } from '../tests/utils';

const buildProps = ({
	email = '',
	displayName = '',
	onClose = jest.fn(),
	onSave = jest.fn()
}: Partial<EditDLControllerComponentProps> = {}): EditDLControllerComponentProps => ({
	email,
	displayName,
	onClose,
	onSave
});

describe('EditDLControllerComponent', () => {
	it('should render an EditDLComponent that displays the DL email', async () => {
		const dlEmail = 'dl-mail@domain.net';
		registerGetDistributionListMembersHandler([]);
		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		expect(await screen.findByText(dlEmail)).toBeVisible();
	});

	it('should render the component when the member field of the response is undefined', async () => {
		const dlEmail = 'dl-mail@domain.net';
		registerGetDistributionListMembersHandler();
		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		expect(await screen.findByText(dlEmail)).toBeVisible();
		expect(screen.getByText('Member list 0')).toBeVisible();
	});

	it('should load all members on first load', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
		await screen.findByText(`Member list ${members.length}`);
		expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(members.length);
	});

	it('should show an error snackbar and call the close callback when the members cannot be loaded', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const onClose = jest.fn();
		registerGetDistributionListMembersHandler([], false, JEST_MOCKED_ERROR);
		setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail, onClose })} />);
		await screen.findByText(dlEmail);
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		expect(onClose).toHaveBeenCalled();
	});

	it('should add all valid emails inside the list when user clicks on add action', async () => {
		const dlEmail = 'dl-mail@domain.net';
		registerGetDistributionListMembersHandler([]);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		const emails = ['john.doe@test.com', 'invalid-email.com', 'mary.white@example.org'];
		await act(async () => {
			await user.type(screen.getByRole('textbox', { name: /type an address/i }), emails.join(','));
		});
		await user.click(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
		);
		const memberElements = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
		expect(memberElements).toHaveLength(2);
		expect(screen.getByText(emails[0])).toBeVisible();
		expect(screen.getByText(emails[2])).toBeVisible();
	});

	it('should add new members on top of the list of members', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		const emails = ['john.doe@test.com', 'mary.white@example.org'];
		await screen.findByText(dlEmail);
		await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
		await act(async () => {
			await user.type(screen.getByRole('textbox', { name: /type an address/i }), emails.join(','));
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
		const dlEmail = 'dl-mail@domain.net';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);

		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
		const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
		const memberToRemoveElement = membersListItems.find(
			(element) => within(element).queryByText(members[4]) !== null
		) as HTMLElement;
		await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
		expect(screen.queryByText(members[4])).not.toBeInTheDocument();
	});

	it('should increase the member list counter when a new member is added', async () => {
		const dlEmail = 'dl-mail@domain.net';
		registerGetDistributionListMembersHandler([
			faker.internet.email(),
			faker.internet.email(),
			faker.internet.email()
		]);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
		await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);

		const newMember = 'newmember@example.com';
		await user.type(screen.getByRole('textbox', { name: /type an address/i }), newMember);
		await user.click(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
		);
		expect(screen.getByText(/member list 4/i)).toBeVisible();
	});

	it('should decrease the member list counter when a member is removed', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const members = [faker.internet.email(), faker.internet.email(), faker.internet.email()];
		registerGetDistributionListMembersHandler(members);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
		const membersListItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
		const memberToRemoveElement = membersListItems.find(
			(element) => within(element).queryByText(members[1]) !== null
		) as HTMLElement;
		await user.click(within(memberToRemoveElement).getByRole('button', { name: /remove/i }));
		expect(screen.getByText(/member list 2/i)).toBeVisible();
	});

	it('should remove duplicated icon from chip when member is removed from the members list', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const duplicatedEmail = faker.internet.email();
		const members = [duplicatedEmail, faker.internet.email(), faker.internet.email()];
		registerGetDistributionListMembersHandler(members);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
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
			expect(screen.queryByTestId(TESTID_SELECTORS.icons.duplicatedMember)).not.toBeInTheDocument()
		);
	});

	it('should remove the duplication error message under the contact input when member is removed from the members list', async () => {
		const dlEmail = 'dl-mail@domain.net';
		const errorMessage = 'Address already present';
		const duplicatedEmail = faker.internet.email();
		const members = [duplicatedEmail];
		registerGetDistributionListMembersHandler(members);
		const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
		await screen.findByText(dlEmail);
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

	describe('Modal footer', () => {
		describe('Cancel action button', () => {
			it('should be enabled', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				expect(screen.getByRole('button', { name: 'cancel' })).toBeEnabled();
			});

			it('should call the onClose callback when clicked', async () => {
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dlEmail = 'dl-mail@domain.net';
				const onClose = jest.fn();
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail, onClose })} />
				);
				await screen.findByText(dlEmail);
				const button = screen.getByRole('button', { name: 'cancel' });
				await user.click(button);
				expect(onClose).toHaveBeenCalled();
			});
		});

		describe('Save action button', () => {
			it('should be visible', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				expect(screen.getByRole('button', { name: 'save' })).toBeVisible();
			});

			it('should be disabled by default', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
			});

			it('should become enabled when a new member is added', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				const newMember = 'newmember@example.com';
				await user.type(screen.getByRole('textbox', { name: /type an address/i }), newMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become enabled when a member is removed', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become disabled when there are no differences from the initial state', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const initialMember = faker.internet.email();
				registerGetDistributionListMembersHandler([faker.internet.email(), initialMember]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				const listItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				const initialMemberItem = listItems.find(
					(item) => within(item).queryByText(initialMember) !== null
				) as HTMLElement;
				await user.click(within(initialMemberItem).getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
				await user.type(screen.getByRole('textbox', { name: /type an address/i }), initialMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeDisabled());
			});

			it('should call the API when clicked', async () => {
				const members = [faker.internet.email()];
				registerGetDistributionListMembersHandler(members);
				const handler = registerDistributionListActionHandler([], members);
				const dlEmail = 'dl-mail@domain.net';
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				await screen.findByTestId(TESTID_SELECTORS.snackbar);
				expect(handler).toHaveBeenCalled();
			});

			it('should show a success snackbar when then API return a success result', async () => {
				const members = [faker.internet.email()];
				registerGetDistributionListMembersHandler(members);
				registerDistributionListActionHandler([], members);
				const dlEmail = 'dl-mail@domain.net';
				const dlDisplayName = 'All group employees';
				const { user } = setupTest(
					<EditDLControllerComponent
						{...buildProps({ email: dlEmail, displayName: dlDisplayName })}
					/>
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				expect(
					await screen.findByText(`"${dlDisplayName}" distribution list edits saved successfully`)
				).toBeVisible();
			});

			it('should call the onSave callback when clicked', async () => {
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dlEmail = 'dl-mail@domain.net';
				const onSave = jest.fn();
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail, onSave })} />
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				await screen.findByTestId(TESTID_SELECTORS.snackbar);
				expect(onSave).toHaveBeenCalled();
			});

			it('should cause a error snackbar to appear when then API return an error result', async () => {
				const members = [faker.internet.email()];
				registerGetDistributionListMembersHandler(members);
				registerDistributionListActionHandler([], members, [JEST_MOCKED_ERROR]);
				const dlEmail = 'dl-mail@domain.net';
				const dlDisplayName = 'All group employees';
				const { user } = setupTest(
					<EditDLControllerComponent
						{...buildProps({ email: dlEmail, displayName: dlDisplayName })}
					/>
				);
				await screen.findByText(dlEmail);
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
			});
		});
	});
});

describe('getMembersPartition', () => {
	it("should return an object with empty members if the two parameters don't contain any value", () => {
		const originalMembers: Array<string> = [];
		const updatedMembers: Array<string> = [];
		const result = getMembersPartition(originalMembers, updatedMembers);
		expect(result).toEqual({ membersToAdd: [], membersToRemove: [] });
	});

	it('should return an object with empty members the two parameters contain the same values', () => {
		const originalMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
		const updatedMembers: Array<string> = ['mario.rossi@dominio.it', 'john.doe@domain.org'];
		const result = getMembersPartition(originalMembers, updatedMembers);
		expect(result).toEqual({ membersToAdd: [], membersToRemove: [] });
	});

	it('should return an object with 3 members to add if the second parameter contains 3 members not included in the first parameter', () => {
		const originalMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
		const updatedMembers: Array<string> = [
			'mario.rossi@dominio.it',
			'john.doe@domain.org',
			'1@dominio.it',
			'2@dominio.it',
			'3@dominio.it'
		];
		const result = getMembersPartition(originalMembers, updatedMembers);
		expect(result).toEqual({
			membersToAdd: ['1@dominio.it', '2@dominio.it', '3@dominio.it'],
			membersToRemove: []
		});
	});

	it('should return an object with 3 members to remove if the first parameter contains 3 members not included in the second parameter', () => {
		const originalMembers: Array<string> = [
			'mario.rossi@dominio.it',
			'john.doe@domain.org',
			'1@dominio.it',
			'2@dominio.it',
			'3@dominio.it'
		];
		const updatedMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
		const result = getMembersPartition(originalMembers, updatedMembers);
		expect(result).toEqual({
			membersToAdd: [],
			membersToRemove: ['1@dominio.it', '2@dominio.it', '3@dominio.it']
		});
	});

	it('should return an object with 2 members to add and 3 members to remove if the parameters contains different members', () => {
		const originalMembers: Array<string> = [
			'1@dominio.it',
			'2@dominio.it',
			'anonymous@hacker.net',
			'3@dominio.it'
		];
		const updatedMembers: Array<string> = [
			'john.doe@domain.org',
			'anonymous@hacker.net',
			'mario.rossi@dominio.it'
		];
		const result = getMembersPartition(originalMembers, updatedMembers);
		expect(result).toEqual({
			membersToAdd: ['john.doe@domain.org', 'mario.rossi@dominio.it'],
			membersToRemove: ['1@dominio.it', '2@dominio.it', '3@dominio.it']
		});
	});
});
