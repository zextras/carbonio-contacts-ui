/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { CGDisplayerDetails, CGDisplayerDetailsProps } from './cg-displayer-details';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { buildMembers } from '../tests/model-builder';

const buildProps = ({
	id = faker.number.int({ min: 1, max: 100 }).toString(),
	title = faker.word.noun(),
	members = []
}: Partial<CGDisplayerDetailsProps> = {}): CGDisplayerDetailsProps => ({
	id,
	title,
	members
});

describe('Contact group displayer details', () => {
	it('should display the name of the CG', () => {
		const title = faker.word.noun();
		setupTest(<CGDisplayerDetails {...buildProps({ title })} />);
		expect(screen.getByText(title)).toBeVisible();
	});

	it('should displays the number of the members of the CG', () => {
		const count = faker.number.int({ min: 1, max: 300 });
		const members = buildMembers(count);
		setupTest(<CGDisplayerDetails {...buildProps({ members })} />);
		expect(screen.getByText(`Addresses: ${count}`)).toBeVisible();
	});

	it.todo('should displays the the avatar with the icon associated to the CG');

	it('should displays the members of the CG', () => {
		const count = faker.number.int({ min: 1, max: 10 });
		const members = buildMembers(count);
		setupTest(<CGDisplayerDetails {...buildProps({ members })} />);
		members.forEach((member) => {
			expect(screen.getByText(member)).toBeVisible();
		});
	});
});
