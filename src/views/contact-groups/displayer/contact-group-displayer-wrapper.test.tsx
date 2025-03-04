/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Route } from 'react-router-dom';

import { screen, setupTest, within } from '../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_WITH_CONTACTS_HINT, TESTID_SELECTORS } from '../../../constants/tests';
import { generateStore } from '../../../legacy/tests/generators/store';
import { buildContactGroup } from '../../../tests/model-builder';
import { ContactGroupDisplayerWrapper } from '../actions/contact-group-displayer-wrapper';
import { CONTACT_GROUPS_PATH } from '../navigation';

describe('Contact groups displayer wrapper', () => {
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
	it('should show empty displayer if no contact group is active but there are contacts groups in the store', async () => {
		setupTest(
			<Route path={`/folder/:folderId/:type?/:id?`}>
				<ContactGroupDisplayerWrapper />
			</Route>,
			{ store, initialEntries: [`/folder/${parent}`] }
		);
		const emptyDisplayerMessage = await screen.findByText(EMPTY_DISPLAYER_WITH_CONTACTS_HINT);
		expect(emptyDisplayerMessage).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it('should show contact group details if a contact group is active', () => {
		setupTest(
			<Route path={`/folder/:folderId/:type?/:id?`}>
				<ContactGroupDisplayerWrapper />
			</Route>,
			{ store, initialEntries: [`/folder/${parent}/${CONTACT_GROUPS_PATH}/${id}`] }
		);

		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(contactGroup.title)
		).toBeVisible();
	});
});
