/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';

import { EditDLControllerComponent } from './edit-dl-controller';
import { screen, setupTest, within } from '../carbonio-ui-commons/test/test-setup';
import { NAMESPACES } from '../constants/api';
import { JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../constants/tests';
import {
	BatchDistributionListActionRequest,
	DistributionListActionRequest
} from '../network/api/distribution-list-action';
import { registerDistributionListActionHandler } from '../tests/msw-handlers/distribution-list-action';
import { registerGetDistributionListMembersHandler } from '../tests/msw-handlers/get-distribution-list-members';
import {
	generateDistributionList,
	generateDistributionListMembersPage,
	getDLContactInput,
	spyUseBoardHooks
} from '../tests/utils';

beforeEach(() => {
	registerGetDistributionListMembersHandler([]);
	spyUseBoardHooks();
});

describe('EditDLControllerComponent', () => {
	describe('Actions', () => {
		describe('Save', () => {
			it('should be visible', async () => {
				const dl = generateDistributionList();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
			});

			it('should be disabled by default', async () => {
				const dl = generateDistributionList();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
			});

			it('should become enabled when a new member is added', async () => {
				const dl = generateDistributionList();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await user.click(await screen.findByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				const newMember = 'newmember@example.com';
				await user.type(screen.getByRole('textbox', { name: /type an address/i }), newMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled());
			});

			it('should become enabled when a member is removed', async () => {
				const dl = generateDistributionList();
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled());
			});

			it('should become enabled when the display name change', async () => {
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.type(screen.getByRole('textbox', { name: /name/i }), 'new display name');
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled());
			});

			it('should become enabled when the description change', async () => {
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.type(screen.getByRole('textbox', { name: /description/i }), 'new description');
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled());
			});

			it('should become disabled when there are no differences from the initial state, while changing members only', async () => {
				const initialMember = faker.internet.email();
				registerGetDistributionListMembersHandler([faker.internet.email(), initialMember]);
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				const listItems = await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				const initialMemberItem = listItems.find(
					(item) => within(item).queryByText(initialMember) !== null
				) as HTMLElement;
				await user.click(within(initialMemberItem).getByRole('button', { name: /remove/i }));
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeEnabled());
				await user.type(screen.getByRole('textbox', { name: /type an address/i }), initialMember);
				await user.click(
					screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.addMembers })
				);
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeDisabled());
			});

			it('should become disabled when there are no differences with the initial state, while editing the details only', async () => {
				const dl = generateDistributionList({ description: '' });
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				const saveButton = screen.getByRole('button', { name: /save/i });
				const nameInput = screen.getByRole('textbox', { name: /name/i });
				const descriptionInput = screen.getByRole('textbox', { name: /description/i });
				await user.type(nameInput, 'new value');
				await waitFor(() => expect(saveButton).toBeEnabled());
				await user.clear(nameInput);
				await user.type(nameInput, dl.displayName);
				await waitFor(() => expect(saveButton).toBeDisabled());
				await user.type(descriptionInput, 'new value');
				await waitFor(() => expect(saveButton).toBeEnabled());
				await user.clear(descriptionInput);
				await waitFor(() => expect(saveButton).toBeDisabled());
			});

			it('should become disabled if there is an error', async () => {
				const dl = generateDistributionList({ description: '' });
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				const saveButton = screen.getByRole('button', { name: /save/i });
				await user.type(screen.getByRole('textbox', { name: /description/i }), faker.word.words());
				await waitFor(() => expect(saveButton).toBeEnabled());
				await user.type(
					screen.getByRole('textbox', { name: /name/i }),
					faker.string.alpha({ length: 257 })
				);
				await waitFor(() => expect(saveButton).toBeDisabled());
			});

			it('should become disabled if save action is successful', async () => {
				const initialState = generateDistributionList({
					members: generateDistributionListMembersPage([])
				});
				const updatedMembers = [faker.internet.email()];
				const updatedState = generateDistributionList({
					members: generateDistributionListMembersPage(updatedMembers)
				});
				registerDistributionListActionHandler({
					displayName: updatedState.displayName,
					membersToAdd: updatedMembers
				});
				const { user } = setupTest(<EditDLControllerComponent distributionList={initialState} />);
				await screen.findByText(initialState.email);
				const nameInput = screen.getByRole('textbox', { name: /name/i });
				await user.clear(nameInput);
				await user.type(nameInput, updatedState.displayName);
				await screen.findByText(updatedState.displayName);
				await user.click(screen.getByText(/member list/i));
				const contactInput = getDLContactInput();
				await user.type(contactInput.textbox, updatedMembers[0]);
				await user.click(contactInput.addMembersIcon);
				await user.click(screen.getByRole('button', { name: /save/i }));
				await screen.findByText(/edits saved successfully/i);
				await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeDisabled());
			});

			it('should call the API when clicked with the modified data', async () => {
				const membersToRemove = [faker.internet.email()];
				const membersToAdd = [faker.internet.email()];
				const dlData = { displayName: faker.word.words(), description: faker.word.words() };
				const dl = generateDistributionList({
					owners: [],
					members: generateDistributionListMembersPage(membersToRemove)
				});
				const handler = registerDistributionListActionHandler({ membersToAdd: [] });
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				await screen.findByTestId(TESTID_SELECTORS.membersListItem);
				// remove a member
				await user.click(screen.getByRole('button', { name: /remove/i }));
				// add a member
				const contactInput = getDLContactInput();
				await user.type(contactInput.textbox, membersToAdd[0]);
				await user.click(contactInput.addMembersIcon);
				await screen.findByTestId(TESTID_SELECTORS.membersListItem);
				// go to details tab
				await user.click(screen.getByText(/details/i));
				const nameInput = await screen.findByRole('textbox', { name: /name/i });
				await user.clear(nameInput);
				await user.type(nameInput, dlData.displayName);
				const descriptionInput = screen.getByRole('textbox', { name: /description/i });
				await user.clear(descriptionInput);
				await user.type(descriptionInput, dlData.description);
				// save
				const button = screen.getByRole('button', { name: /save/i });
				await user.click(button);
				await screen.findByTestId(TESTID_SELECTORS.snackbar);
				expect(handler).toHaveBeenCalledTimes(1);
				expect(await handler.mock.lastCall?.[0].json()).toEqual(
					expect.objectContaining<{
						Body: { BatchRequest: BatchDistributionListActionRequest };
					}>({
						Body: {
							BatchRequest: {
								_jsns: NAMESPACES.generic,
								DistributionListActionRequest: [
									expect.objectContaining<Partial<DistributionListActionRequest>>({
										action: {
											op: 'modify',
											a: [
												{ n: 'displayName', _content: dlData.displayName },
												{ n: 'description', _content: dlData.description }
											]
										}
									}),
									expect.objectContaining<Partial<DistributionListActionRequest>>({
										action: {
											op: 'addMembers',
											dlm: membersToAdd.map((member) => ({ _content: member }))
										}
									}),
									expect.objectContaining<Partial<DistributionListActionRequest>>({
										action: {
											op: 'removeMembers',
											dlm: membersToRemove.map((member) => ({ _content: member }))
										}
									})
								]
							}
						}
					})
				);
			});

			it('should show a success snackbar when then API return a success result', async () => {
				const members = [faker.internet.email()];
				registerGetDistributionListMembersHandler(members);
				registerDistributionListActionHandler({});
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: /save/i });
				await user.click(button);
				expect(
					await screen.findByText(`"${dl.displayName}" distribution list edits saved successfully`)
				).toBeVisible();
			});

			it('should cause a error snackbar to appear when then API return an error result', async () => {
				const members = [faker.internet.email()];
				registerGetDistributionListMembersHandler(members);
				registerDistributionListActionHandler({}, [JEST_MOCKED_ERROR]);
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				await screen.findAllByTestId(TESTID_SELECTORS.membersListItem);
				await user.click(screen.getByRole('button', { name: /remove/i }));
				const button = screen.getByRole('button', { name: /save/i });
				await user.click(button);
				expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
			});
		});

		describe('Discard', () => {
			it('should be enabled by default', async () => {
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dl = generateDistributionList();
				setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				const discardButton = screen.getByRole('button', { name: /discard/i });
				expect(discardButton).toBeVisible();
				expect(discardButton).toBeEnabled();
			});

			it('should reset all fields to the initial state', async () => {
				const membersToRemove = [faker.internet.email()];
				const membersToAdd = [faker.internet.email()];
				const dlData = { displayName: faker.word.words(), description: faker.word.words() };
				const dl = generateDistributionList({
					owners: [],
					members: generateDistributionListMembersPage(membersToRemove),
					description: faker.lorem.sentence()
				});
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.click(screen.getByText(/member list/i));
				await screen.findByTestId(TESTID_SELECTORS.membersListItem);
				// check initial data
				expect(screen.getByText(membersToRemove[0])).toBeVisible();
				expect(screen.queryByText(membersToAdd[0])).not.toBeInTheDocument();
				// remove the existing member
				await user.click(screen.getByRole('button', { name: /remove/i }));
				// add a member
				const contactInput = getDLContactInput();
				await user.type(contactInput.textbox, membersToAdd[0]);
				await user.click(contactInput.addMembersIcon);
				await screen.findByTestId(TESTID_SELECTORS.membersListItem);
				// check updated data
				expect(screen.queryByText(membersToRemove[0])).not.toBeInTheDocument();
				expect(screen.getByText(membersToAdd[0])).toBeVisible();
				// go to details tab
				await user.click(screen.getByText(/details/i));
				const nameInput = await screen.findByRole('textbox', { name: /name/i });
				// initial data is visible
				expect(nameInput).toHaveValue(dl.displayName);
				await user.clear(nameInput);
				await user.type(nameInput, dlData.displayName);
				const descriptionInput = screen.getByRole('textbox', { name: /description/i });
				// initial data is visible
				expect(descriptionInput).toHaveValue(dl.description);
				await user.clear(descriptionInput);
				await user.type(descriptionInput, dlData.description);
				// check updated data
				expect(nameInput).toHaveValue(dlData.displayName);
				expect(descriptionInput).toHaveValue(dlData.description);

				// discard action
				const button = screen.getByRole('button', { name: /discard/i });
				await user.click(button);

				// check that initial data is set again
				await waitFor(() => expect(nameInput).toHaveValue(dl.displayName));
				expect(descriptionInput).toHaveValue(dl.description);
				await user.click(screen.getByText(/member list/i));
				expect(await screen.findByText(membersToRemove[0])).toBeVisible();
				expect(screen.queryByText(membersToAdd[0])).not.toBeInTheDocument();
			});

			it('should make save button become disabled', async () => {
				registerGetDistributionListMembersHandler([faker.internet.email()]);
				const dl = generateDistributionList();
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				await screen.findByText(dl.email);
				await user.type(screen.getByRole('textbox', { name: /name/i }), 'something');
				await user.click(screen.getByRole('button', { name: /discard/i }));
				expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
			});

			it('should reset board title to the initial one', async () => {
				const updateBoardFn = jest.fn();
				spyUseBoardHooks(updateBoardFn);
				const dlData = { displayName: faker.word.words(), description: faker.word.words() };
				const dl = generateDistributionList({
					owners: [],
					members: generateDistributionListMembersPage([]),
					description: faker.lorem.sentence()
				});
				const { user } = setupTest(<EditDLControllerComponent distributionList={dl} />);
				const nameInput = await screen.findByRole('textbox', { name: /name/i });
				await user.clear(nameInput);
				await user.type(nameInput, dlData.displayName);
				await screen.findByText(dlData.displayName);
				expect(updateBoardFn).toHaveBeenCalledWith({ title: dlData.displayName });
				await user.click(screen.getByRole('button', { name: /discard/i }));
				await screen.findByText(dl.displayName);
				expect(updateBoardFn).toHaveBeenLastCalledWith({ title: dl.displayName });
			});
		});

		it('should update initial state on save and reset to this new state on following discard', async () => {
			const initialState = generateDistributionList({
				members: generateDistributionListMembersPage([])
			});
			const updatedMembers = [faker.internet.email()];
			const updatedState = generateDistributionList({
				members: generateDistributionListMembersPage(updatedMembers)
			});
			registerDistributionListActionHandler({
				displayName: updatedState.displayName,
				membersToAdd: updatedMembers
			});
			const { user } = setupTest(<EditDLControllerComponent distributionList={initialState} />);
			await screen.findByText(initialState.email);
			let nameInput = screen.getByRole('textbox', { name: /name/i });
			await user.clear(nameInput);
			await user.type(nameInput, updatedState.displayName);
			await screen.findByText(updatedState.displayName);
			await user.click(screen.getByText(/member list/i));
			const contactInput = getDLContactInput();
			await user.type(contactInput.textbox, updatedMembers[0]);
			await user.click(contactInput.addMembersIcon);
			await user.click(screen.getByRole('button', { name: /save/i }));
			await screen.findByText(/edits saved successfully/i);
			await user.click(screen.getByRole('button', { name: /remove/i }));
			await user.click(screen.getByText(/details/i));
			nameInput = await screen.findByRole('textbox', { name: /name/i });
			await user.clear(nameInput);
			const textToDiscard = faker.word.words();
			await user.type(nameInput, textToDiscard);
			await screen.findByText(textToDiscard);
			await user.click(screen.getByRole('button', { name: /discard/i }));
			await screen.findByText(updatedState.displayName);
			expect(nameInput).toHaveValue(updatedState.displayName);
			await user.click(screen.getByText(/member list/i));
			expect(await screen.findByText(updatedMembers[0])).toBeVisible();
		});
	});
});
