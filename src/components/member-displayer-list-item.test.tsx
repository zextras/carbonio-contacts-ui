/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { MemberDisplayerListItemComponent } from './member-displayer-list-item';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

describe('Member displayer item', () => {
	it('should show the email of the member', () => {
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(screen.getByText(email)).toBeVisible();
	});

	it('should show the avatar', () => {
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(screen.getByTestId(TESTID_SELECTORS.avatar)).toBeVisible();
	});

	it.todo('should show the send email action button');

	it.todo('should show the copy address action button');

	it.todo('should call the send email integration function when user clicks on send mail button');

	it.todo('should copy into clipboard function when user clicks on copy address button');
});
