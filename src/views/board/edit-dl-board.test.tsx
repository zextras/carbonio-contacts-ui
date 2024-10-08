/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import * as shell from '@zextras/carbonio-shell-ui';
import { EventEmitter } from 'events';
import { HttpResponse } from 'msw';
import { Route } from 'react-router-dom';

import EditDLBoard, { EditDLBoardContext } from './edit-dl-board';
import { screen, setupTest, within } from '../../carbonio-ui-commons/test/test-setup';
import { ROUTES, ROUTES_INTERNAL_PARAMS } from '../../constants';
import { JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../../constants/tests';
import { DistributionList } from '../../model/distribution-list';
import { GetDistributionListResponse } from '../../network/api/get-distribution-list';
import { GetDistributionListMembersResponse } from '../../network/api/get-distribution-list-members';
import { useDistributionListsStore } from '../../store/distribution-lists';
import { registerDistributionListActionHandler } from '../../tests/msw-handlers/distribution-list-action';
import {
	buildGetDistributionListResponse,
	registerGetDistributionListHandler
} from '../../tests/msw-handlers/get-distribution-list';
import {
	buildGetDistributionListMembersResponse,
	registerGetDistributionListMembersHandler
} from '../../tests/msw-handlers/get-distribution-list-members';
import {
	buildSoapResponse,
	delayUntil,
	generateDistributionList,
	generateDistributionListMembersPage,
	getDLContactInput,
	spyUseBoardHooks
} from '../../tests/utils';
import { DistributionListsView } from '../distribution-list/distribution-lists-view';

const spyUseBoard = (dl: DistributionList | undefined): void => {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: dl ? ({ id: dl.id } satisfies EditDLBoardContext) : undefined,
		id: '',
		boardViewId: '',
		app: '',
		icon: '',
		title: ''
	});
};

beforeEach(() => {
	spyUseBoardHooks();
	registerGetDistributionListMembersHandler([]);
});

describe('Edit DL board', () => {
	it('should show the distribution list edit view', async () => {
		const dl = generateDistributionList({ description: '', owners: [] });
		useDistributionListsStore.getState().setDistributionLists([dl]);
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(screen.getByText(/details/i)).toBeVisible();
		expect(screen.getByText(/member list/i)).toBeVisible();
		expect(screen.getByText(/manager list/i)).toBeVisible();
		expect(screen.getByRole('button', { name: /save/i })).toBeVisible();
		expect(screen.getByRole('button', { name: /discard/i })).toBeVisible();
	});

	it('should show an error message if board is opened without a distribution list', () => {
		spyUseBoard(undefined);
		setupTest(<EditDLBoard />);
		expect(screen.getByText(/something went wrong/i)).toBeVisible();
	});

	it('should load distribution list to edit from network if not stored', async () => {
		const dl = generateDistributionList();
		const getDLHandler = registerGetDistributionListHandler(dl);
		const getMembersHandler = registerGetDistributionListMembersHandler([]);
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(getDLHandler).toHaveBeenCalled();
		expect(getMembersHandler).toHaveBeenCalled();
	});

	it('should not request distribution list to network if details are already stored', async () => {
		const dl = generateDistributionList({
			description: '',
			owners: [],
			isOwner: true,
			isMember: false
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const getDLHandler = registerGetDistributionListHandler(dl);
		const getMembersHandler = registerGetDistributionListMembersHandler();
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(getDLHandler).not.toHaveBeenCalled();
		expect(getMembersHandler).toHaveBeenCalled();
	});

	it('should not request members to network if they are already stored', async () => {
		jest.spyOn(console, 'warn').mockImplementation();
		const member = faker.internet.email();
		const dl = generateDistributionList({
			description: '',
			owners: [],
			isOwner: true,
			isMember: false,
			members: generateDistributionListMembersPage([member])
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const getDLHandler = registerGetDistributionListHandler(dl);
		const getMembersHandler = registerGetDistributionListMembersHandler();
		spyUseBoard(dl);
		const { user } = setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		await user.click(screen.getByText(/member list/i));
		expect(await screen.findByText(member)).toBeVisible();
		expect(getDLHandler).not.toHaveBeenCalled();
		expect(getMembersHandler).not.toHaveBeenCalled();
	});

	it('should show an error snackbar when members cannot be loaded', async () => {
		const dl = generateDistributionList({
			isOwner: true,
			isMember: true,
			description: '',
			owners: []
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		registerGetDistributionListMembersHandler([], false, JEST_MOCKED_ERROR);
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		await screen.findByText(dl.email);
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	describe('Details tab', () => {
		it('should show dl data inside input fields', async () => {
			const description = faker.word.words();
			const dl = generateDistributionList({ description });
			useDistributionListsStore.getState().setDistributionLists([dl]);
			spyUseBoard(dl);
			setupTest(<EditDLBoard />);
			await screen.findByText(dl.displayName);
			expect(screen.getByRole('textbox', { name: 'Distribution List name' })).toHaveValue(
				dl.displayName
			);
			expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(description);
		});
	});

	describe('Members tab', () => {
		it('should show shimmed list items while loading members', async () => {
			const member = faker.internet.email();
			const dl = generateDistributionList({
				description: '',
				owners: [],
				isOwner: true,
				isMember: false,
				members: undefined
			});
			useDistributionListsStore.getState().setDistributionLists([dl]);
			const emitter = new EventEmitter();
			const EMITTER_RESOLVE = 'resolve';
			registerGetDistributionListMembersHandler().mockImplementation(async () => {
				await delayUntil(emitter, EMITTER_RESOLVE);
				return HttpResponse.json(
					buildSoapResponse<GetDistributionListMembersResponse>({
						GetDistributionListMembersResponse: buildGetDistributionListMembersResponse([member])
					})
				);
			});
			spyUseBoard(dl);
			const { user } = setupTest(<EditDLBoard />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/member list/i));
			expect((await screen.findAllByTestId(TESTID_SELECTORS.shimmedListItem))[0]).toBeVisible();
			emitter.emit(EMITTER_RESOLVE);
			await waitFor(() =>
				expect(screen.queryByTestId(TESTID_SELECTORS.shimmedListItem)).not.toBeInTheDocument()
			);
			expect(await screen.findByText(member)).toBeVisible();
		});
	});

	describe('Managers tab', () => {
		it('should show shimmed list items while loading managers', async () => {
			const owner = faker.internet.email();
			const dl = generateDistributionList({
				description: '',
				owners: undefined,
				isOwner: true,
				isMember: false,
				members: generateDistributionListMembersPage([])
			});
			useDistributionListsStore.getState().setDistributionLists([dl]);
			const emitter = new EventEmitter();
			const EMITTER_RESOLVE = 'resolve';
			registerGetDistributionListHandler(dl).mockImplementation(async () => {
				await delayUntil(emitter, EMITTER_RESOLVE);
				return HttpResponse.json(
					buildSoapResponse<GetDistributionListResponse>({
						GetDistributionListResponse: buildGetDistributionListResponse({
							...dl,
							owners: [{ id: faker.string.uuid(), name: owner }]
						})
					})
				);
			});
			spyUseBoard(dl);
			const { user } = setupTest(<EditDLBoard />);
			await screen.findByText(dl.email);
			await user.click(screen.getByText(/manager list/i));
			expect((await screen.findAllByTestId(TESTID_SELECTORS.shimmedListItem))[0]).toBeVisible();
			emitter.emit(EMITTER_RESOLVE);
			await screen.findByText(owner);
		});
	});

	it('should update display name in both list and displayer on save', async () => {
		const dl = generateDistributionList({
			isMember: true,
			isOwner: true,
			description: '',
			owners: [],
			members: generateDistributionListMembersPage([])
		});
		const newName = `${dl.displayName} updated`;
		useDistributionListsStore.getState().setDistributionLists([dl]);
		registerDistributionListActionHandler({ displayName: newName });
		spyUseBoard(dl);
		const { user } = setupTest(
			<>
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>
				<EditDLBoard />
			</>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		await screen.findAllByText(dl.email);
		await screen.findByText(/description/i);
		await within(screen.getByTestId(TESTID_SELECTORS.mainList)).findByText(dl.displayName);
		await user.type(screen.getByRole('textbox', { name: /name/i }), ' updated');
		await act(async () => {
			await user.click(screen.getByRole('button', { name: /save/i }));
		});
		await screen.findAllByText(newName);
		expect(within(screen.getByTestId(TESTID_SELECTORS.mainList)).getByText(newName)).toBeVisible();
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(newName)
		).toBeVisible();
		const displayerInfoContainer = within(
			screen.getByTestId(TESTID_SELECTORS.displayer)
		).getByTestId(TESTID_SELECTORS.infoContainer);
		expect(within(displayerInfoContainer).getByText(newName)).toBeVisible();
	});

	it('should update description in displayer on save', async () => {
		const dl = generateDistributionList({
			isMember: true,
			isOwner: true,
			description: '',
			owners: [],
			members: generateDistributionListMembersPage([])
		});
		const newDescription = `new description`;
		useDistributionListsStore.getState().setDistributionLists([dl]);
		registerDistributionListActionHandler({ description: newDescription });
		spyUseBoard(dl);
		const { user } = setupTest(
			<>
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>
				<EditDLBoard />
			</>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		await screen.findAllByText(dl.email);
		await screen.findByText(/description/i);
		await user.clear(screen.getByRole('textbox', { name: /description/i }));
		await user.type(screen.getByRole('textbox', { name: /description/i }), newDescription);
		await act(async () => {
			await user.click(screen.getByRole('button', { name: /save/i }));
		});
		await screen.findAllByText(newDescription);
		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayer)).getByText(newDescription)
		).toBeVisible();
	});

	it('should update member list in displayer on save', async () => {
		const initialMember = faker.internet.email();
		const membersToAdd = [faker.internet.email(), faker.internet.email()];
		const dl = generateDistributionList({
			isMember: true,
			isOwner: true,
			description: '',
			owners: [],
			members: generateDistributionListMembersPage([initialMember])
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		registerDistributionListActionHandler({ membersToAdd });
		spyUseBoard(dl);
		const { user } = setupTest(
			<>
				<Route path={`${ROUTES.mainRoute}${ROUTES.distributionLists}`}>
					<DistributionListsView />
				</Route>
				<EditDLBoard />
			</>,
			{
				initialEntries: [
					`/${ROUTES_INTERNAL_PARAMS.route.distributionLists}/${ROUTES_INTERNAL_PARAMS.filter.member}/${dl.id}`
				]
			}
		);
		await screen.findAllByText(dl.email);
		await screen.findByText(/description/i);
		const displayer = screen.getByTestId(TESTID_SELECTORS.displayer);
		const editBoard = screen.getByTestId(TESTID_SELECTORS.editDLComponent);
		await user.click(within(displayer).getByText(/member list/i));
		await within(displayer).findByText(initialMember);
		await user.click(within(editBoard).getByText(/member list/i));
		await within(editBoard).findByText(initialMember);
		await user.click(screen.getByRole('button', { name: /remove/i }));
		// the removed member remains visible inside the displayer since it is not saved yet
		expect(within(displayer).getByText(initialMember)).toBeVisible();
		const contactInput = getDLContactInput();
		await act(async () => {
			await user.type(contactInput.textbox, membersToAdd.join(','));
		});
		await user.click(contactInput.addMembersIcon);
		await within(editBoard).findAllByTestId(TESTID_SELECTORS.membersListItem);
		// the added member is not visible inside the displayer since it is not saved yet
		expect(within(displayer).queryByText(membersToAdd[0])).not.toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: /save/i }));
		expect(await within(displayer).findByText(membersToAdd[0])).toBeVisible();
		expect(within(displayer).getByText(membersToAdd[1])).toBeVisible();
		expect(within(displayer).queryByText(initialMember)).not.toBeInTheDocument();
		expect(within(displayer).getByText('Member list 2')).toBeVisible();
	});
});
