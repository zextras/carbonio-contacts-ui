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
import { DistributionListOwner } from '../model/distribution-list';
import {
	registerDistributionListActionHandler,
	registerGetDistributionListHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { generateDistributionList, getDLContactInput } from '../tests/utils';

const buildProps = ({
	email = '',
	displayName = '',
	...rest
}: Partial<EditDLControllerComponentProps> = {}): EditDLControllerComponentProps => ({
	email,
	displayName,
	...rest
});

beforeEach(() => {
	registerGetDistributionListMembersHandler([]);
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
		expect(screen.getByText('Details')).toBeVisible();
		expect(screen.getByText('Member list')).toBeVisible();
		expect(screen.getByText('Manager list')).toBeVisible();
		expect(screen.getAllByTestId(/tab\d+/i)).toHaveLength(3);
	});

	it('should show details tab by default', async () => {
		const dl = generateDistributionList();
		setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
		await screen.findByText(dl.displayName);
		expect(screen.getByRole('textbox', { name: 'Distribution List name' })).toBeVisible();
		expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible();
		expect(screen.queryByText(/member list \d+/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/manager list \d+/i)).not.toBeInTheDocument();
	});

	describe('Details tab', () => {
		it('should show dl data inside input fields', async () => {
			const description = faker.lorem.sentences();
			const dl = generateDistributionList({ description });
			setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.displayName);
			expect(screen.getByRole('textbox', { name: 'Distribution List name' })).toHaveValue(
				dl.displayName
			);
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(description);
		});
	});

	describe('Members tab', () => {
		it('should render the component when the member field of the response is undefined', async () => {
			const dl = generateDistributionList();
			registerGetDistributionListMembersHandler(undefined);
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			expect(await screen.findByText(dl.email)).toBeVisible();
			await user.click(screen.getByText(/member list/i));
			expect(await screen.findByText('Member list 0')).toBeVisible();
		});

		it('should load all members on first load', async () => {
			const dl = generateDistributionList();
			const members = times(10, () => faker.internet.email());
			registerGetDistributionListMembersHandler(members);

			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			await screen.findByText(`Member list ${members.length}`);
			expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(members.length);
		});

		it('should not retrieve members from network if they are provided as prop', async () => {
			const members = times(10, () => faker.internet.email());
			const dl = generateDistributionList({
				members: { members, total: members.length, more: false }
			});
			const handler = registerGetDistributionListMembersHandler(members);

			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			await screen.findByText(`Member list ${members.length}`);
			expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(members.length);
			expect(handler).not.toHaveBeenCalled();
		});

		it('should show an error snackbar when the members cannot be loaded', async () => {
			const dl = generateDistributionList();
			registerGetDistributionListMembersHandler([], false, JEST_MOCKED_ERROR);
			setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.email);
			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should add all valid emails inside the list when user clicks on add action', async () => {
			const dlEmail = 'dl-mail@domain.net';
			registerGetDistributionListMembersHandler([]);

			const { user } = setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
			const emails = ['john.doe@test.com', 'invalid-email.com', 'mary.white@example.org'];
			await user.click(screen.getByText(/member list/i));
			await screen.findByText(/member list 0/i);
			await act(async () => {
				await user.type(
					screen.getByRole('textbox', { name: /type an address/i }),
					emails.join(',')
				);
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
			const dl = generateDistributionList();
			const members = times(10, () => faker.internet.email());
			registerGetDistributionListMembersHandler(members);

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
			const dl = generateDistributionList();
			const members = times(10, () => faker.internet.email());
			registerGetDistributionListMembersHandler(members);

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
			const dl = generateDistributionList();
			registerGetDistributionListMembersHandler([
				faker.internet.email(),
				faker.internet.email(),
				faker.internet.email()
			]);
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
			const dl = generateDistributionList();
			const members = [faker.internet.email(), faker.internet.email(), faker.internet.email()];
			registerGetDistributionListMembersHandler(members);
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
			const dl = generateDistributionList();
			const duplicatedEmail = faker.internet.email();
			const members = [duplicatedEmail, faker.internet.email(), faker.internet.email()];
			registerGetDistributionListMembersHandler(members);
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
			const dl = generateDistributionList();
			const errorMessage = 'Address already present';
			const duplicatedEmail = faker.internet.email();
			const members = [duplicatedEmail];
			registerGetDistributionListMembersHandler(members);
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

	describe('Managers tab', () => {
		it('should retrieve managers from network only once', async () => {
			const owners = times<DistributionListOwner>(10, () => ({
				id: faker.string.uuid(),
				name: faker.internet.email()
			}));
			const dl = generateDistributionList({ owners: undefined });
			const getDLHandler = registerGetDistributionListHandler({ ...dl, owners });
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.displayName);
			await user.click(screen.getByText(/manager list/i));
			await screen.findByText(owners[0].name);
			expect(getDLHandler).toHaveBeenCalledTimes(1);
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
			const { user } = setupTest(<EditDLControllerComponent {...buildProps(dl)} />);
			await screen.findByText(dl.displayName);
			await user.click(screen.getByText(/manager list/i));
			await screen.findByText(owners[0].name);
			expect(getDLHandler).not.toHaveBeenCalled();
		});
	});

	describe('Actions', () => {
		describe('Save', () => {
			it('should be visible', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
				await screen.findByText(dlEmail);
				expect(screen.getByRole('button', { name: 'save' })).toBeVisible();
			});

			it('should be disabled by default', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent {...buildProps({ email: dlEmail })} />);
				await screen.findByText(dlEmail);
				expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
			});

			it('should become enabled when a new member is added', async () => {
				const dlEmail = 'dl-mail@domain.net';
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await user.click(screen.getByText(/member list/i));
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
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become enabled when the display name change', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await user.type(screen.getByRole('textbox', { name: /name/i }), 'new display name');
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become enabled when the description change', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await user.type(screen.getByRole('textbox', { name: /description/i }), 'new description');
				await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled());
			});

			it('should become disabled when there are no differences from the initial state, while changing members only', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const initialMember = faker.internet.email();
				registerGetDistributionListMembersHandler([faker.internet.email(), initialMember]);
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				await user.click(screen.getByText(/member list/i));
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

			it('should become disabled when there are no differences with the initial state, while editing the details only', async () => {
				const dlEmail = 'dl-mail@domain.net';
				const { user } = setupTest(
					<EditDLControllerComponent {...buildProps({ email: dlEmail })} />
				);
				await screen.findByText(dlEmail);
				const saveButton = screen.getByRole('button', { name: /save/i });
				const nameInput = screen.getByRole('textbox', { name: /name/i });
				const descriptionInput = screen.getByRole('textbox', { name: /name/i });
				await user.type(nameInput, 'new value');
				await waitFor(() => expect(saveButton).toBeEnabled());
				await user.clear(nameInput);
				await waitFor(() => expect(saveButton).toBeDisabled());
				await user.type(descriptionInput, 'new value');
				await waitFor(() => expect(saveButton).toBeEnabled());
				await user.clear(descriptionInput);
				await waitFor(() => expect(saveButton).toBeDisabled());
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
				await user.click(screen.getByText(/member list/i));
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
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				expect(
					await screen.findByText(`"${dlDisplayName}" distribution list edits saved successfully`)
				).toBeVisible();
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
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: 'save' });
				await user.click(button);
				expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
			});
		});

		describe('Discard', () => {
			it.todo('should be enabled by default');

			it.todo('should reset all fields to the initial state');

			it.todo('should make save button become disabled');
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

	it('should return an object with empty members if the two parameters contain the same values', () => {
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
