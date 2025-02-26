/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ContactGroupDisplayer } from './contact-group-displayer';
import { screen, setupTest, within } from '../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_HINT, TESTID_SELECTORS } from '../../../constants/tests';
import { generateStore } from '../../../legacy/tests/generators/store';
import { buildContactGroup } from '../../../tests/model-builder';
import { CONTACT_GROUPS_PATH } from '../navigation';

describe('Displayer controller', () => {
	const contactGroup = buildContactGroup();
	const { parent, id } = contactGroup;
	const store = generateStore({
		contacts: {
			contacts: {
				[parent]: [contactGroup]
			},
			status: {},
			searchedInFolder: {}
		}
	});
	it('should show empty displayer if no contact group is active', async () => {
		setupTest(<ContactGroupDisplayer />, {
			store,
			initialEntries: [`/folder/${parent}`],
			path: `/folder/:folderId/:type?/:id?`
		});
		await screen.findByText(EMPTY_DISPLAYER_HINT);
		expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it('should show contact group details if a contact group is active', () => {
		setupTest(<ContactGroupDisplayer />, {
			store,
			initialEntries: [`/folder/${parent}/${CONTACT_GROUPS_PATH}/${id}`],
			path: `/folder/:folderId/:type?/:id?`
		});

		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(contactGroup.title)
		).toBeVisible();
	});
});
