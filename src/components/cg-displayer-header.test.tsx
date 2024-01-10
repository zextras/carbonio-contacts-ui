/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { CGDisplayerHeader } from './cg-displayer-header';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import * as activeItem from '../hooks/useActiveItem';
import { UseActiveItemReturnType } from '../hooks/useActiveItem';

describe('Displayer header', () => {
	it('should display the icon for the CGs', () => {
		const title = faker.word.noun();
		setupTest(<CGDisplayerHeader title={title} />);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
	});

	it('should display the CG name', () => {
		const title = faker.word.noun();
		setupTest(<CGDisplayerHeader title={title} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	it('should display the close icon', () => {
		const title = faker.word.noun();
		setupTest(<CGDisplayerHeader title={title} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).toBeVisible();
	});

	it('should call the removeActive function of the useActiveItem hook when the user clicks on the close icon', async () => {
		const stub: UseActiveItemReturnType = {
			isActive: jest.fn(),
			setActive: jest.fn(),
			removeActive: jest.fn(),
			activeItem: ''
		};
		jest.spyOn(activeItem, 'useActiveItem').mockImplementation(() => stub);
		const title = faker.word.noun();
		const { user } = setupTest(<CGDisplayerHeader title={title} />);
		const closeButton = screen.getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.closeDisplayer
		});

		await user.click(closeButton);

		expect(stub.removeActive).toHaveBeenCalled();
	});
});
