/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { times } from 'lodash';

import { EditDLMembersComponent, EditDLComponentProps } from './edit-dl-members';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { PALETTE, TESTID_SELECTORS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';
import 'jest-styled-components';
import { registerFullAutocompleteHandler } from '../tests/msw-handlers/full-autocomplete';
import { getDLContactInput } from '../tests/utils';

const buildProps = ({
	members = [],
	totalMembers = 0,
	onRemoveMember = jest.fn(),
	onAddMembers = jest.fn(),
	resetRef = React.createRef(),
	...rest
}: Partial<EditDLComponentProps> = {}): EditDLComponentProps => ({
	members,
	totalMembers,
	onRemoveMember,
	onAddMembers,
	resetRef,
	...rest
});

describe('Edit DL Members Component', () => {
	it('should show a description to let the user understand how to use the inputs', () => {
		const hint =
			'You can filter this list by looking for specific member’s name or add new ones by editing the Distribution List.';
		setupTest(<EditDLMembersComponent {...buildProps()} />);
		expect(screen.getByText(hint)).toBeVisible();
	});

	it('should show the input to add new elements', () => {
		setupTest(<EditDLMembersComponent {...buildProps()} />);
		const contactInput = getDLContactInput();
		expect(contactInput.textbox).toBeVisible();
		expect(contactInput.addMembersIcon).toBeVisible();
	});

	it('should show the input to filter an address', () => {
		const placeholder = 'Filter an address';
		setupTest(<EditDLMembersComponent {...buildProps()} />);
		const searchInput = screen.getByTestId(TESTID_SELECTORS.dlMembersFilterInput);
		const searchInputTextBox = within(searchInput).getByRole('textbox', { name: placeholder });
		expect(searchInputTextBox).toBeVisible();
		const searchInputIcon = within(searchInput).getByTestId(TESTID_SELECTORS.icons.filterMembers);
		expect(searchInputIcon).toBeVisible();
	});

	it('should show the total number of members', () => {
		const totalMembers = 10;
		setupTest(<EditDLMembersComponent {...buildProps({ totalMembers })} />);
		expect(screen.getByText(`Member list ${totalMembers}`)).toBeVisible();
	});

	describe('Add members', () => {
		it('add action should be disabled if the input is empty', () => {
			setupTest(<EditDLMembersComponent {...buildProps()} />);
			expect(getDLContactInput().addMembersIcon).toBeDisabled();
		});

		it('add action should be disabled if all values are invalid', async () => {
			const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />);
			const invalidValues = ['bad', 'worst'];
			await act(async () => {
				await user.type(getDLContactInput().textbox, invalidValues.join(','));
			});

			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			).toBeDisabled();
		});

		it('add action should be disabled if all values are duplicated', async () => {
			const members = ['1@domain.com', '2@domain.com'];
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
			const contactInput = getDLContactInput();
			const values = ['1@domain.com', '2@domain.com'];
			await act(async () => {
				await user.type(contactInput.textbox, values.join(','));
			});

			expect(contactInput.addMembersIcon).toBeDisabled();
		});

		it('add action should be disabled if all values are duplicated or invalid', async () => {
			const members = ['1@domain.com', '2@domain.com'];
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
			const contactInput = getDLContactInput();
			const values = ['1@domain.com', '2@domain.com', '3453453', 'aaaaaaabbbbbb'];
			await act(async () => {
				await user.type(contactInput.textbox, values.join(','));
			});

			expect(contactInput.addMembersIcon).toBeDisabled();
		});

		it('add action should be enabled if the input contains at least a valid value', async () => {
			const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />);
			const values = ['bad', 'correct.email@domain.com', 'worst'];
			await act(async () => {
				await user.type(getDLContactInput().textbox, values.join(','));
			});

			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
			).toBeEnabled();
		});

		it('chip should show email if contact is added from options', async () => {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const email = faker.internet.email({ firstName, lastName });

			registerFullAutocompleteHandler([{ first: firstName, last: lastName, email }]);

			const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />);

			const contactInput = getDLContactInput();

			await user.type(contactInput.textbox, email.substring(0, 3));
			act(() => {
				// run timers of dropdown
				jest.runOnlyPendingTimers();
			});
			await screen.findByTestId(TESTID_SELECTORS.dropdownList);
			const dropdownOption = await screen.findByText(email, { exact: false });
			expect(dropdownOption).toBeVisible();
			await act(async () => {
				await user.click(dropdownOption);
			});

			expect(
				await within(contactInput.container).findByText(email, { exact: false })
			).toBeVisible();
		});

		it('chip should show email if contact is added manually by typing', async () => {
			const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />);
			const contactInput = getDLContactInput();
			const email = faker.internet.email();
			await act(async () => {
				await user.type(contactInput.textbox, `${email},`);
			});

			expect(within(contactInput.container).getByText(email)).toBeVisible();
			expect(contactInput.textbox).not.toHaveDisplayValue(email);
		});

		it('should call the onAddMember callback when the user clicks the add action', async () => {
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ onAddMembers })} />);
			const contactInput = getDLContactInput();
			await act(async () => {
				await user.type(contactInput.textbox, `${faker.internet.email()},`);
			});

			await user.click(contactInput.addMembersIcon);
			expect(onAddMembers).toHaveBeenCalled();
		});

		it('should call the onAddMember callback with only the valid emails', async () => {
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ onAddMembers })} />);
			const contactInput = getDLContactInput();
			const values = ['bad', 'correct.email@domain.com', 'worst', 'supercorrect.email@domain.net'];
			await act(async () => {
				await user.type(contactInput.textbox, values.join(','));
			});

			await user.click(contactInput.addMembersIcon);
			expect(onAddMembers).toHaveBeenCalledWith([
				'correct.email@domain.com',
				'supercorrect.email@domain.net'
			]);
		});

		it('should leave only invalid values inside input when user clicks on add action', async () => {
			const onAddMembers = jest.fn();
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ onAddMembers })} />);
			const contactInput = getDLContactInput();
			const values = ['bad', 'correct.email@domain.com', 'worst', 'supercorrect.email@domain.net'];
			await act(async () => {
				await user.type(contactInput.textbox, values.join(','));
			});

			await user.click(contactInput.addMembersIcon);
			await waitFor(() => expect(onAddMembers).toHaveBeenCalled());
			await waitFor(() => expect(screen.queryByText(values[1])).not.toBeInTheDocument());
			expect(screen.getByText(values[0])).toBeVisible();
			expect(screen.getByText(values[2])).toBeVisible();
			expect(screen.queryByText(values[1])).not.toBeInTheDocument();
			expect(screen.queryByText(values[3])).not.toBeInTheDocument();
		});

		it('should leave duplicated values inside the input when the user clicks on add', async () => {
			const members = ['duplicated.email@domain.com'];
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
			const contactInput = getDLContactInput();
			const values = ['duplicated.email@domain.com', 'correct.email@domain.net'];
			await act(async () => {
				await user.type(contactInput.textbox, values.join(','));
			});

			await act(async () => {
				await user.click(contactInput.addMembersIcon);
			});
			await waitFor(() =>
				expect(within(contactInput.container).queryByText(values[1])).not.toBeInTheDocument()
			);
			expect(within(contactInput.container).getByText(values[0])).toBeVisible();
		});

		describe('Error message contact input', () => {
			it('should render "Invalid address" error message when there is only an invalid email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid address';
				const validMail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${invalidMail},`);
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},`);
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid addresses" error message when there are only invalid emails (at least 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid addresses';
				const validMail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${invalidMail1},${invalidMail2},`);
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},`);
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should remove the invalid address error message under the contact input when the invalid chip is removed', async () => {
				const errorMessage = 'Invalid address';
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<EditDLMembersComponent {...buildProps()} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${invalidMail},`);
				});

				const closeButton = screen.getByRoleWithIcon('button', {
					icon: TESTID_SELECTORS.icons.close
				});

				await user.click(closeButton);
				await waitFor(() => expect(screen.queryByText(errorMessage)).not.toBeInTheDocument());
			});

			it('should render "Address already present" error message when there is only a duplicated email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Address already present';
				const validMail = faker.internet.email();
				const members = [validMail];
				const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},`);
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await act(async () => {
					await user.type(contactInput.textbox, `${faker.internet.email()},`);
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Addresses already present" error message when there is only duplicated email (>= 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Addresses already present';
				const validMail = faker.internet.email();
				const validMail2 = faker.internet.email();
				const members = [validMail, validMail2];
				const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},${validMail2},`);
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await act(async () => {
					await user.type(contactInput.textbox, `${faker.internet.email()},`);
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid and already present addresses" error message when there are at least 1 error chip per type and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid and already present addresses';
				const validMail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const members = [validMail];
				const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />, {
					store: generateStore()
				});
				const contactInput = getDLContactInput();
				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},${invalidMail},`);
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await act(async () => {
					await user.type(contactInput.textbox, `${faker.internet.email()},`);
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render AlertCircle error icon inside chip when the chip is a duplicated email', async () => {
				const validMail = faker.internet.email();
				const members = [validMail];
				const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
				const contactInput = getDLContactInput();

				await act(async () => {
					await user.type(contactInput.textbox, `${validMail},`);
				});

				expect(
					within(screen.getByTestId(TESTID_SELECTORS.contactInputChip)).getByTestId(
						TESTID_SELECTORS.icons.duplicatedMember
					)
				).toBeVisible();
			});
		});
	});

	describe('Members list', () => {
		it('should show the list of members', () => {
			const totalMembers = 10;
			const members: Array<string> = [];
			times(totalMembers, () => {
				members.push(faker.internet.email());
			});
			setupTest(<EditDLMembersComponent {...buildProps({ totalMembers, members })} />);
			members.forEach((member) => {
				expect(screen.getByText(member)).toBeVisible();
			});
		});

		it('should call onRemoveMember with member email if the remove action button for that member is clicked', async () => {
			const members: Array<string> = [];
			times(10, () => {
				members.push(faker.internet.email());
			});
			const onRemoveFn = jest.fn();
			const { user } = setupTest(
				<EditDLMembersComponent {...buildProps({ members, onRemoveMember: onRemoveFn })} />
			);
			const listItem = screen
				.getAllByTestId(TESTID_SELECTORS.membersListItem)
				.find((item) => within(item).queryByText(members[4]) !== null);
			expect(listItem).toBeDefined();
			await user.click(within(listItem as HTMLElement).getByRole('button', { name: 'remove' }));
			expect(onRemoveFn).toHaveBeenCalledWith(members[4]);
		});

		it('should show only members with a match with the search input content', async () => {
			const members: Array<string> = [
				'john.smith@example.org',
				'mario.rossi@test.com',
				'abraham.lincoln@president.usa',
				'bianchi@radiomaria.com',
				'do-not-reply@unknown.net'
			];
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
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
			const { user } = setupTest(<EditDLMembersComponent {...buildProps({ members })} />);
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

		it('should show 3 shimmed list items while loading', () => {
			setupTest(
				<EditDLMembersComponent
					{...buildProps({ members: ['john.smith@example.org'], loading: true })}
				/>
			);
			expect(screen.queryByText('john.smith@example.org')).not.toBeInTheDocument();
			const shimmedItems = screen.getAllByTestId(TESTID_SELECTORS.shimmedListItem);
			expect(shimmedItems).toHaveLength(3);
			expect(shimmedItems[0]).toBeVisible();
		});
	});
});
