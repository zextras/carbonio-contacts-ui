/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { ContactGroupListItemMainAccount } from './contact-group-list-item-main-account';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { buildContactGroup, buildMembers } from '../../../tests/model-builder';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: (): { id: string } => ({ id: '' })
}));

describe('Contact group list item', () => {
	describe('Actions', () => {
		it('should show send mail action when the contact group has at least 1 member', () => {
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
			const contactGroup = buildContactGroup({
				members: buildMembers(faker.number.int({ min: 1, max: 100 }))
			});

			setupTest(<ContactGroupListItemMainAccount contactGroup={contactGroup} visible />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.sendEmail)).toBeVisible();
		});
		it('should hide send mail action when the contact group has 0 members', () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItemMainAccount contactGroup={contactGroup} visible />);
			expect(screen.queryByTestId(TESTID_SELECTORS.icons.sendEmail)).not.toBeInTheDocument();
		});
		it('should show delete action', () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItemMainAccount contactGroup={contactGroup} visible />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.trash)).toBeVisible();
		});
	});
});
