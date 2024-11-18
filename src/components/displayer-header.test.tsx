/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { noop } from 'lodash';

import { DisplayerHeader } from './displayer-header';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

describe('Displayer header', () => {
	it('should display the icon', () => {
		const title = faker.word.noun();
		const icon = 'PeopleOutline';
		setupTest(<DisplayerHeader title={title} icon={icon} />);
		expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
	});

	it('should display the title', () => {
		const title = faker.word.noun();
		const icon = 'PeopleOutline';
		setupTest(<DisplayerHeader title={title} icon={icon} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	it('should display the close icon only if closeDisplayer is defined', () => {
		const title = faker.word.noun();
		const icon = 'PeopleOutline';
		setupTest(<DisplayerHeader title={title} icon={icon} closeDisplayer={noop} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).toBeVisible();
	});

	it('should call the removeActive function of the useActiveItem hook when the user clicks on the close icon', async () => {
		const spyCloseDisplayer = jest.fn();
		const title = faker.word.noun();
		const icon = 'PeopleOutline';
		const { user } = setupTest(
			<DisplayerHeader title={title} icon={icon} closeDisplayer={spyCloseDisplayer} />
		);
		const closeButton = screen.getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.closeDisplayer
		});

		await user.click(closeButton);

		expect(spyCloseDisplayer).toHaveBeenCalled();
	});
});
