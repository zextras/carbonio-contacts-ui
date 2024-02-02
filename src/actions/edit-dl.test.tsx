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
			url: expect.anything()
		});
	});
});
