/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { ContactGroupListItemWrapper } from './contact-group-list-item-wrapper';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { generateStore } from '../../../legacy/tests/generators/store';
import { buildContactGroup, buildMembers } from '../../../tests/model-builder';
import { CONTACT_GROUP_DELETE_ICON } from '../actions/constants';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: (): { id: string } => ({ id: '' })
}));

describe('Contact group list item', () => {
	const store = generateStore();
	describe('Actions', () => {
		beforeAll(() => {
			const mailTo = { id: 'mail-to', label: 'action.send_msg', execute: jest.fn() };
			jest.spyOn(shell, 'getAction').mockReturnValue([mailTo, true]);
		});
		it('should show send mail action when the contact group has at least 1 member', () => {
			jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
			const contactGroup = buildContactGroup({
				members: buildMembers(faker.number.int({ min: 1, max: 100 }))
			});

			setupTest(<ContactGroupListItemWrapper contactGroup={contactGroup} />, { store });
			expect(screen.getByTestId(TESTID_SELECTORS.icons.sendEmail)).toBeVisible();
		});
		it('should show send mail action as disabled when the contact group has 0 members', async () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItemWrapper contactGroup={contactGroup} />, { store });
			const mailToActionButton = screen.getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.sendEmail
			});
			expect(mailToActionButton).toBeInTheDocument();
			expect(mailToActionButton).toBeDisabled();
		});
		it('should show delete action', () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItemWrapper contactGroup={contactGroup} />, { store });
			expect(screen.getByTestId(`icon: ${CONTACT_GROUP_DELETE_ICON}`)).toBeVisible();
		});
	});
});
