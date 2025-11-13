/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act, within } from '@testing-library/react';
import { first, forEach, last, noop } from 'lodash';

import { setupTest, screen } from '@test-setup';
import { CONTACT_GROUP_NAME_MAX_LENGTH } from 'constants/index';
import { PALETTE, TESTID_SELECTORS } from 'constants/tests';
import { buildContactGroup } from 'tests/model-builder';
import { spyUseBoardHooks } from 'tests/utils';
import {
	CommonContactGroupBoard,
	CommonContactGroupBoardProps
} from 'views/board/common-contact-group-board';

function getContactInput(): HTMLElement {
	return screen.getByRole('textbox', {
		name: `Type an address`
	});
}

const buildProps = ({
	initialMemberListEmails = [],
	memberListEmails = [],
	nameValue = '',
	initialNameValue = '',
	initialFolderId = '7',
	setFolderId = noop,
	setNameValue = noop,
	isOnSaveDisabled = false,
	setMemberListEmails = noop,
	onSave = noop
}: Partial<CommonContactGroupBoardProps> = {}): CommonContactGroupBoardProps => ({
	initialMemberListEmails,
	memberListEmails,
	nameValue,
	initialFolderId,
	setFolderId,
	initialNameValue,
	setNameValue,
	isOnSaveDisabled,
	setMemberListEmails,
	onSave
});

const contactGroup = buildContactGroup();
beforeEach(() => {
	spyUseBoardHooks();
});

describe('Common contact group board', () => {
	describe('Default visualization', () => {
		it('should show fields for group name and addresses list', () => {
			setupTest(<CommonContactGroupBoard {...buildProps()} />);
			expect(screen.getByRole('textbox', { name: 'Group name*' })).toBeVisible();
			expect(screen.getByText('Addresses list')).toBeVisible();
			expect(getContactInput()).toBeVisible();
			expect(screen.getByText(`Type an address`)).toHaveStyleRule(
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
		});

		describe('Error message contact input', () => {
			it('should render "Invalid address" error message when try to confirm invalid email', async () => {
				const errorMessage = 'Invalid address';
				const invalidEmail = 'test@';
				const { user } = setupTest(<CommonContactGroupBoard {...buildProps()} />);
				const contactInput = getContactInput();

				await user.type(contactInput, invalidEmail);
				await act(async () => {
					await user.keyboard('{Enter}');
				});

				expect(await screen.findByText(errorMessage)).toBeVisible();
			});
		});
	});
});
