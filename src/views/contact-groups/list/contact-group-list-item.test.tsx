/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { screen, setupTest } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { TESTID_SELECTORS } from 'constants/tests';
import { buildContactGroup, buildMembers } from 'tests/model-builder';
import { ContactGroupListItem } from 'views/contact-groups/list/contact-group-list-item';

describe('Contact group list item', () => {
	beforeEach(() => {
		populateFoldersStore();
	});
	describe('Actions', () => {
		it('should show send mail action when the contact group has at least 1 member', () => {
			const contactGroup = buildContactGroup({
				members: buildMembers(faker.number.int({ min: 1, max: 100 }))
			});

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			expect(screen.getByTestId(TESTID_SELECTORS.icons.sendEmail)).toBeInTheDocument();
		});

		it('should show send mail action as disabled when the contact group has 0 members', async () => {
			const contactGroup = buildContactGroup();

			const { user } = setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			const actionWrapper = await screen.findByTestId(`contact-group-list-item-${contactGroup.id}`);
			await user.hover(actionWrapper);
			const mailToActionButton = await screen.findByTestId('send-email-action');

			expect(mailToActionButton).toBeInTheDocument();
			expect(mailToActionButton).toBeDisabled();
		});

		it('should display trash action', async () => {
			const contactGroup = buildContactGroup();

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			const trashActionButton = await screen.findByTestId('move-to-trash-action');

			expect(trashActionButton).toBeInTheDocument();
			expect(trashActionButton).toBeEnabled();
		});

		it('should display delete action when contact group is in trash', async () => {
			const contactGroup = buildContactGroup({ parent: FOLDERS.TRASH });

			setupTest(<ContactGroupListItem contactGroup={contactGroup} />);
			const deletePermanentlyActionButton = await screen.findByTestId('delete-permanently-action');

			expect(deletePermanentlyActionButton).toBeInTheDocument();
			expect(deletePermanentlyActionButton).toBeEnabled();
		});
	});
});
