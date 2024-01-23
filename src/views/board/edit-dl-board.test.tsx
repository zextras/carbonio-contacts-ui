/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import EditDLBoard from './edit-dl-board';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { generateDistributionList } from '../../tests/utils';

describe('Edit DL board', () => {
	it('should show the distribution list edit view', async () => {
		const dl = generateDistributionList();
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: dl,
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});
		setupTest(<EditDLBoard />);
		expect(await screen.findByText(dl.email)).toBeVisible();
	});

	it('should show an error message if board is opened without a distribution list', () => {
		jest.spyOn(shell, 'useBoard').mockReturnValue({
			context: undefined,
			id: '',
			url: '',
			app: '',
			icon: '',
			title: ''
		});
		setupTest(<EditDLBoard />);
		expect(screen.getByText(/something went wrong/i)).toBeVisible();
	});
});
