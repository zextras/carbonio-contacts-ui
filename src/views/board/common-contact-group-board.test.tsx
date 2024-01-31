/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import 'jest-styled-components';
import { act, within } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { first, forEach, last, noop } from 'lodash';

import CommonContactGroupBoard, {
	CommonContactGroupBoardProps
} from './common-contact-group-board';
import { setupTest, screen } from '../../carbonio-ui-commons/test/test-setup';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from '../../constants';
import { PALETTE, TESTID_SELECTORS } from '../../constants/tests';
import { buildContactGroup } from '../../tests/model-builder';
import { registerFullAutocompleteHandler } from '../../tests/msw-handlers/full-autocomplete';

export function getContactInput(): HTMLElement {
	return screen.getByRole('textbox', {
		name: `Type an address, click ‘+’ to add to the group`
	});
}

const buildProps = ({
	initialMemberListEmails = [],
	memberListEmails = [],
	nameValue = '',
	initialNameValue = '',
	setNameValue = noop,
	isOnSaveDisabled = false,
	setMemberListEmails = noop,
	onSave = noop
}: Partial<CommonContactGroupBoardProps> = {}): CommonContactGroupBoardProps => ({
	initialMemberListEmails,
	memberListEmails,
	nameValue,
	initialNameValue,
	setNameValue,
	isOnSaveDisabled,
	setMemberListEmails,
	onSave
});

function spyUseBoardHooks(updateBoardFn?: jest.Mock, closeBoardFn?: jest.Mock): void {
	jest.spyOn(shell, 'useBoardHooks').mockReturnValue({
		updateBoard: updateBoardFn ?? jest.fn(),
		setCurrentBoard: jest.fn(),
		getBoardContext: jest.fn(),
		getBoard: jest.fn(),
		closeBoard: closeBoardFn ?? jest.fn()
	});
}

const contactGroup = buildContactGroup();
beforeAll(() => {
	spyUseBoardHooks();
});

describe('Common contact group board', () => {
	describe('Default visualization', () => {
		it('should show fields for group name and addresses list', () => {
			setupTest(<CommonContactGroupBoard {...buildProps()} />);
			expect(screen.getByRole('textbox', { name: 'Group name*' })).toBeVisible();
			expect(screen.getByText('Addresses list')).toBeVisible();
			expect(getContactInput()).toBeVisible();
			expect(screen.getByText(`Type an address, click ‘+’ to add to the group`)).toHaveStyleRule(
				'color',
				PALETTE.secondary.regular
			);
		});

		it('should render discard and save buttons', () => {
			setupTest(<CommonContactGroupBoard {...buildProps()} />);
			expect(screen.getByRole('button', { name: /DISCARD/i })).toBeVisible();
			expect(
				screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
			).toBeVisible();
		});

		it('should render the avatar icon, name and the number of addresses', () => {
			setupTest(<CommonContactGroupBoard {...buildProps({ nameValue: contactGroup.title })} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
			expect(screen.getByText(contactGroup.title)).toBeVisible();
			expect(screen.getByText('Addresses: 0')).toBeVisible();
		});

		it('should render New Group string by default in the name input', () => {
			setupTest(<CommonContactGroupBoard {...buildProps({ nameValue: contactGroup.title })} />);
			expect(screen.getByRole('textbox', { name: 'Group name*' })).toHaveValue(contactGroup.title);
		});
	});

	describe('Save button behaviours', () => {
		describe('Save button disabled', () => {
			it('should disable the save button when isOnSaveDisabled prop is true', async () => {
				setupTest(<CommonContactGroupBoard {...buildProps({ isOnSaveDisabled: true })} />);
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeDisabled();
			});

			it('should enable the save button when isOnSaveDisabled prop is false', async () => {
				setupTest(<CommonContactGroupBoard {...buildProps({ isOnSaveDisabled: false })} />);
				expect(
					screen.getByRoleWithIcon('button', { name: /SAVE/i, icon: TESTID_SELECTORS.icons.save })
				).toBeEnabled();
			});
		});
	});

	describe('Discard button', () => {
		it('should call setNameValue with the initial name when click on the discard button', async () => {
			const setNameValueMock = jest.fn();
			const { user } = setupTest(
				<CommonContactGroupBoard
					{...buildProps({
						nameValue: faker.company.name(),
						initialNameValue: contactGroup.title,
						setNameValue: setNameValueMock
					})}
				/>
			);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(setNameValueMock).toHaveBeenCalledWith(contactGroup.title);
		});

		it('should delete chips when click on the discard button', async () => {
			const newEmail = faker.internet.email();
			const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);

			const contactInput = getContactInput();
			await user.type(contactInput, newEmail);
			await act(async () => {
				await user.type(contactInput, ',');
			});
			await act(async () => {
				await user.click(screen.getByRole('button', { name: /discard/i }));
			});
			expect(screen.queryByTestId(TESTID_SELECTORS.contactInputChip)).not.toBeInTheDocument();
		});

		it('should call setMemberListEmails with the initialMemberListEmails when click on the discard button', async () => {
			const setMemberListEmailsMock = jest.fn();
			const initialMemberListEmails = [faker.internet.email()];
			const { user } = setupTest(
				<CommonContactGroupBoard
					{...buildProps({ initialMemberListEmails, setMemberListEmails: setMemberListEmailsMock })}
				/>
			);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(setMemberListEmailsMock).toHaveBeenCalledWith(initialMemberListEmails);
		});

		it('should reset board title', async () => {
			const updateBoard = jest.fn();
			spyUseBoardHooks(updateBoard);

			const { user } = setupTest(
				<CommonContactGroupBoard
					{...buildProps({
						nameValue: faker.company.name(),
						initialNameValue: contactGroup.title
					})}
				/>
			);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			expect(updateBoard).toBeCalledTimes(2);
			expect(updateBoard).toHaveBeenLastCalledWith({ title: contactGroup.title });
		});
	});

	describe('Name', () => {
		it('should call setNameValue when update name', async () => {
			const setNameValueMock = jest.fn();
			const newName = faker.string.alpha(5);
			const { user } = setupTest(
				<CommonContactGroupBoard
					{...buildProps({
						setNameValue: setNameValueMock
					})}
				/>
			);
			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			forEach(newName, (char) => {
				expect(setNameValueMock).toHaveBeenCalledWith(char);
			});
		});

		it('should update board title', async () => {
			const updateBoard = jest.fn();
			spyUseBoardHooks(updateBoard);
			const newName = faker.string.alpha(10);
			const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);

			const nameInput = screen.getByRole('textbox', { name: 'Group name*' });
			await user.clear(nameInput);
			await user.type(nameInput, newName);
			forEach(newName, (char) => {
				expect(updateBoard).toHaveBeenCalledWith({ title: char });
			});
		});

		describe('Error message', () => {
			it('should show the error message in red when the name input length is 0', async () => {
				const errorMessage = 'Group name is required, enter a name to proceed';
				setupTest(<CommonContactGroupBoard {...buildProps()} />);
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});

			it('should show the error message when the name input contains only space characters', async () => {
				setupTest(<CommonContactGroupBoard {...buildProps({ nameValue: '   ' })} />);
				expect(screen.getByText('Group name is required, enter a name to proceed')).toBeVisible();
			});

			it('should show the error message in red when the name input length is greater than 256', async () => {
				const errorMessage = 'Maximum length allowed is 256 characters';
				const newName = faker.string.alphanumeric(CONTACT_GROUP_NAME_MAX_LENGTH + 1);
				setupTest(<CommonContactGroupBoard {...buildProps({ nameValue: newName })} />);
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
			});
		});
	});

	describe('Addresses list', () => {
		describe('Plus button and contact input', () => {
			it('should enable the plus button when at least a valid chip is in the contact input', async () => {
				const newEmail = faker.internet.email();
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);

				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});

			it('should enable the plus button when both valid and invalid chips are in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});

			it('should disable the plus button when there are no chips in the contact input', async () => {
				setupTest(<CommonContactGroupBoard {...buildProps()} />);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should disable the plus button when there are only invalid chips in the contact input', async () => {
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should disable the plus button when the user insert a duplicated chip only', async () => {
				const validMail = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard {...buildProps({ memberListEmails: [validMail] })} />
				);
				const contactInput = getContactInput();
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeDisabled();
			});

			it('should enable the plus button when the user add a chip from the dropdown', async () => {
				const email = faker.internet.email();
				registerFullAutocompleteHandler([{ first: faker.person.firstName(), email }]);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, email.substring(0, 3));
				act(() => {
					// run timers of dropdown
					jest.runOnlyPendingTimers();
				});
				await screen.findByTestId(TESTID_SELECTORS.dropdownList);

				const dropdownOption = await screen.findByText(email);
				expect(dropdownOption).toBeVisible();
				await user.click(dropdownOption);
				expect(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				).toBeEnabled();
			});
		});

		describe('Contact group add and remove members', () => {
			it('should render the avatar and the remove button on the list', async () => {
				const email = faker.internet.email();
				setupTest(<CommonContactGroupBoard {...buildProps({ memberListEmails: [email] })} />);
				const memberList = await screen.findByTestId(TESTID_SELECTORS.membersList);
				const avatar = within(memberList).getByTestId(TESTID_SELECTORS.avatar);
				expect(avatar).toBeVisible();
				expect(avatar).toHaveTextContent(`${first(email)}${last(email)}`.toUpperCase());
				expect(
					screen.getByRoleWithIcon('button', {
						name: /remove/i,
						icon: TESTID_SELECTORS.icons.trash
					})
				);
			});

			it('should call setMemberListEmailsMock without the email when click on the remove button', async () => {
				const setMemberListEmailsMock = jest.fn();
				const email = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard
						{...buildProps({
							memberListEmails: [email],
							setMemberListEmails: setMemberListEmailsMock
						})}
					/>
				);
				await user.click(
					screen.getByRoleWithIcon('button', {
						icon: TESTID_SELECTORS.icons.trash,
						name: /remove/i
					})
				);
				expect(setMemberListEmailsMock).toHaveBeenLastCalledWith([]);
			});

			it('should remove valid chip from input when the user clicks on plus button', async () => {
				const email = faker.internet.email();
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, email);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByTestId(TESTID_SELECTORS.contactInputChip)).toBeVisible();
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(screen.queryByTestId(TESTID_SELECTORS.contactInputChip)).not.toBeInTheDocument();
			});

			it('should remove valid chip and maintain invalid ones in the contact input', async () => {
				const newEmail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, newEmail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();
				expect(within(chipInput).getByText(newEmail)).toBeVisible();
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(within(chipInput).queryByText(newEmail)).not.toBeInTheDocument();
				expect(within(chipInput).getByText(invalidMail1)).toBeVisible();
				expect(within(chipInput).getByText(invalidMail2)).toBeVisible();
			});

			it('should remove valid chip and maintain duplicated ones in the contact input', async () => {
				const email1 = faker.internet.email();
				const email2 = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard {...buildProps({ memberListEmails: [email1] })} />
				);
				const contactInput = getContactInput();
				const chipInput = screen.getByTestId(TESTID_SELECTORS.cgContactInput);
				await user.type(contactInput, email2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, email1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await act(async () => {
					await user.click(
						screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
					);
				});
				expect(within(chipInput).queryByText(email2)).not.toBeInTheDocument();
				expect(within(chipInput).getByText(email1)).toBeVisible();
			});
		});

		describe('Error message contact input', () => {
			it('should render "Invalid address" error message when there is only an invalid email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid address';
				const validMail = faker.internet.email();
				const invalidMail = faker.string.alpha(10);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid addresses" error message when there are only invalid emails (at least 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid addresses';
				const validMail = faker.internet.email();
				const invalidMail1 = faker.string.alpha(10);
				const invalidMail2 = faker.string.alpha(10);
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();
				await user.type(contactInput, invalidMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, invalidMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Address already present" error message when there is only a duplicated email as a chip and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Address already present';
				const validMail = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard {...buildProps({ memberListEmails: [validMail] })} />
				);
				const contactInput = getContactInput();

				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Addresses already present" error message when there are only duplicated emails (at least 2) as chips and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Addresses already present';
				const validMail1 = faker.internet.email();
				const validMail2 = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard
						{...buildProps({ memberListEmails: [validMail1, validMail2] })}
					/>
				);
				const contactInput = getContactInput();

				await user.type(contactInput, validMail1);
				await act(async () => {
					await user.type(contactInput, ',');
				});
				await user.type(contactInput, validMail2);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});

			it('should render "Invalid and already present addresses" error message when there are at least 1 error chip per type and remove the error when a valid chip is added', async () => {
				const errorMessage = 'Invalid and already present addresses';
				const validMail = faker.internet.email();
				const { user } = setupTest(
					<CommonContactGroupBoard {...buildProps({ memberListEmails: [validMail] })} />
				);
				const contactInput = getContactInput();

				await user.type(contactInput, faker.string.alpha(10));
				await act(async () => {
					await user.type(contactInput, ',');
				});

				await user.type(contactInput, validMail);
				await act(async () => {
					await user.type(contactInput, ',');
				});

				expect(screen.getByText(errorMessage)).toBeVisible();
				expect(screen.getByText(errorMessage)).toHaveStyleRule('color', PALETTE.error.regular);
				await user.type(contactInput, faker.internet.email());
				await act(async () => {
					await user.type(contactInput, ',');
				});
				expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
			});
		});
	});
});
