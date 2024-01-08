/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { CGListItem } from './c-g-list-item';
import { screen, setupTest } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { buildContactGroup, buildMembers } from '../tests/model-builder';

describe('Contact group list item', () => {
	describe('Actions', () => {
		it('should show send mail action when the contact group has at least 1 member', () => {
			const contactGroup = buildContactGroup({
				members: buildMembers(faker.number.int({ min: 1, max: 100 }))
			});
			setupTest(<CGListItem {...contactGroup} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.sendMail)).toBeVisible();
		});
		it('should hide send mail action when the contact group has 0 members', () => {
			const contactGroup = buildContactGroup();
			setupTest(<CGListItem {...contactGroup} />);
			expect(screen.queryByTestId(TESTID_SELECTORS.icons.sendMail)).not.toBeInTheDocument();
		});
	});
});
