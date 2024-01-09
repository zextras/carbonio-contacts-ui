/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { Action } from '@zextras/carbonio-design-system';
import { times } from 'lodash';

import { CGDisplayerActionsHeader } from './cg-displayer-actions-header';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';

describe('Contact group displayer header actions', () => {
	it('should display no buttons if no action is passed', () => {
		const actions: Array<Action> = [];
		setupTest(<CGDisplayerActionsHeader actions={actions} />);
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('should display a button for each action passed as prop', () => {
		const actions: Array<Action> = times(faker.number.int({ min: 1, max: 20 }), (index) => ({
			id: `action-id-${index}`,
			icon: `action-icon-${index}`,
			label: `Stub action ${index}`,
			onClick: jest.fn()
		}));
		setupTest(<CGDisplayerActionsHeader actions={actions} />);
		actions.forEach((action) => {
			expect(screen.getByRole('button', { name: action.label })).toBeVisible();
		});
	});
});
