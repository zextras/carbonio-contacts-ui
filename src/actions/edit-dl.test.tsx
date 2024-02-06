/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { useActionEditDL } from './edit-dl';
import { UIAction } from './types';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { EDIT_DL_BOARD_ID } from '../constants';
import { generateDistributionList } from '../tests/utils';

describe('useActionEditDL', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionEditDL);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Edit2Outline',
				label: 'Edit',
				id: 'dl-edit-action'
			})
		);
	});

	it('should return an execute field which opens a board with the dl info', async () => {
		const addBoardFn = jest.spyOn(shell, 'addBoard');

		const members = times(10, () => faker.internet.email());
		const dl = generateDistributionList({
			members: { members, total: members.length, more: false }
		});
		const { result } = setupHook(useActionEditDL);
		const action = result.current;
		action.execute(dl);

		expect(addBoardFn).toHaveBeenCalledWith<Parameters<typeof shell.addBoard>>({
			title: dl.displayName,
			icon: 'DistributionListOutline',
			context: dl,
			id: `${EDIT_DL_BOARD_ID}-${dl.id}`,
			url: expect.anything()
		});
	});

	it('should show the email in the title if the dl has no display name', async () => {
		const addBoardFn = jest.spyOn(shell, 'addBoard');

		const dl = generateDistributionList({ displayName: undefined });
		const { result } = setupHook(useActionEditDL);
		const action = result.current;
		action.execute(dl);

		expect(addBoardFn).toHaveBeenCalledWith<Parameters<typeof shell.addBoard>>({
			title: dl.email,
			icon: 'DistributionListOutline',
			context: dl,
			id: `${EDIT_DL_BOARD_ID}-${dl.id}`,
			url: expect.anything()
		});
	});

	it('should not open a new board, but reopen the existing tab, if the user is already editing the distribution list', async () => {
		const addBoardFn = jest.spyOn(shell, 'addBoard');
		const dl = generateDistributionList();
		const boardId = `${EDIT_DL_BOARD_ID}-${dl.id}`;
		jest.spyOn(shell, 'getBoardById').mockReturnValue({
			id: boardId,
			url: EDIT_DL_BOARD_ID,
			app: '',
			icon: '',
			title: ''
		});
		const setCurrentBoardFn = jest.spyOn(shell, 'setCurrentBoard');
		const reopenBoardsFn = jest.spyOn(shell, 'reopenBoards');

		const { result } = setupHook(useActionEditDL);
		const action = result.current;
		action.execute(dl);

		expect(addBoardFn).not.toHaveBeenCalled();
		expect(setCurrentBoardFn).toHaveBeenCalledTimes(1);
		expect(setCurrentBoardFn).toHaveBeenCalledWith<Parameters<typeof shell.setCurrentBoard>>(
			boardId
		);
		expect(reopenBoardsFn).toHaveBeenCalledTimes(1);
	});
});
