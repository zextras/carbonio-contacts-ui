/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { ContactGroupListItem } from './contact-group-list-item';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { buildContactGroup, buildMembers } from '../../../tests/model-builder';
import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useParams: (): { id: string } => ({ id: '' })
}));

describe('Contact group list item', () => {
	beforeEach(() => {
		populateFoldersStore();
		jest.clearAllMocks();
	});
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

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.sendEmail)).toBeVisible();
		});
		it('should show send mail action as disabled when the contact group has 0 members', async () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			const mailToActionButton = screen.getByRoleWithIcon('button', {
				icon: TESTID_SELECTORS.icons.sendEmail
			});
			expect(mailToActionButton).toBeInTheDocument();
			expect(mailToActionButton).toBeDisabled();
		});
		it('should display trash action', () => {
			populateFoldersStore();
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.trash)).toBeVisible();
		});
		it('should display delete action when contact group is in trash', () => {
			populateFoldersStore();
			const contactGroup = buildContactGroup({ parent: FOLDERS.TRASH });

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.deletePermanently)).toBeVisible();
		});
	});
});
