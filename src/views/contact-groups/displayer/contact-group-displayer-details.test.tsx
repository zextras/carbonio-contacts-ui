/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { ContactGroupDisplayerDetails } from './contact-group-displayer-details';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { buildContactGroup, buildMembers } from '../../../tests/model-builder';

describe('Contact group displayer details', () => {
	it('should display the name of the CG', () => {
		const title = faker.word.noun();
		setupTest(<ContactGroupDisplayerDetails contactGroup={buildContactGroup({ title })} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	it('should display the number of the members of the CG', () => {
		const count = faker.number.int({ min: 1, max: 300 });
		const members = buildMembers(count);
		setupTest(<ContactGroupDisplayerDetails contactGroup={buildContactGroup({ members })} />);
		expect(screen.getByText(`Addresses: ${count}`)).toBeVisible();
	});

	it('should display the avatar with the icon associated to the CG', () => {
		setupTest(<ContactGroupDisplayerDetails contactGroup={buildContactGroup()} />);
		expect(screen.getByTestId('avatar')).toBeVisible();
		expect(screen.getByTestId(TESTID_SELECTORS.icons.contactGroup)).toBeVisible();
	});

	it('should display the members of the CG', () => {
		const count = faker.number.int({ min: 1, max: 10 });
		const members = buildMembers(count);
		setupTest(<ContactGroupDisplayerDetails contactGroup={buildContactGroup({ members })} />);
		members.forEach((member) => {
			expect(screen.getByText(member)).toBeVisible();
		});
	});
});
