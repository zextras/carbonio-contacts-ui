/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { noop } from 'lodash';

import { ListActionIconButton } from './list-action-icon-button';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';

describe('List action icon button', () => {
	it('should render the action as disabled', async () => {
		const actionButton = {
			id: 'test',
			disabled: true,
			onClick: noop,
			icon: 'PeopleOutline'
		};
		setupTest(<ListActionIconButton action={actionButton} />);

		const disabledButton = await screen.findByRole('button');
		expect(disabledButton).toBeVisible();
		expect(disabledButton).toBeDisabled();
	});
});
