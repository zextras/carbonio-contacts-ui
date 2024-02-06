/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import EditDLBoard, { EditDLBoardContext } from './edit-dl-board';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { DistributionList } from '../../model/distribution-list';
import { useDistributionListsStore } from '../../store/distribution-lists';
import { registerGetDistributionListHandler } from '../../tests/msw-handlers/get-distribution-list';
import { generateDistributionList, spyUseBoardHooks } from '../../tests/utils';

const spyUseBoard = (dl: DistributionList | undefined): void => {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: dl ? ({ id: dl.id } satisfies EditDLBoardContext) : undefined,
		id: '',
		url: '',
		app: '',
		icon: '',
		title: ''
	});
};

beforeEach(() => {
	spyUseBoardHooks();
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
		const handler = registerGetDistributionListHandler(dl);
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(handler).toHaveBeenCalled();
	});

	it('should not request distribution list to network if it is already stored', async () => {
		const dl = generateDistributionList({
			description: '',
			owners: [],
			isOwner: true,
			isMember: false
		});
		useDistributionListsStore.getState().setDistributionLists([dl]);
		const handler = registerGetDistributionListHandler(dl);
		spyUseBoard(dl);
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
		expect(handler).not.toHaveBeenCalled();
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
});
