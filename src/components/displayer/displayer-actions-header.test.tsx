/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { Button } from '@zextras/carbonio-design-system';
import { times } from 'lodash';

import { DisplayerActionsHeader } from './displayer-actions-header';
import { screen, setupTest } from '@zextras/carbonio-ui-commons';

describe('Contact group displayer header actions', () => {
	it('should display no buttons if no children is passed', () => {
		setupTest(<DisplayerActionsHeader />);
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('should display a button for each action passed as prop', () => {
		const actions = times(faker.number.int({ min: 1, max: 20 }), (index) => ({
			id: `action-id-${index}`,
			icon: `action-icon-${index}`,
			label: `Stub action ${index}`,
			onClick: jest.fn()
		}));
		const actionButtons = actions.map((action) => (
			<Button key={action.label} onClick={action.onClick} label={action.label} />
		));
		setupTest(<DisplayerActionsHeader>{actionButtons}</DisplayerActionsHeader>);
		actions.forEach((action) => {
			expect(screen.getByRole('button', { name: action.label })).toBeVisible();
		});
	});
});
