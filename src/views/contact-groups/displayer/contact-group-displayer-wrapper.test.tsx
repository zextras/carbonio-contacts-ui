/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ContactGroupDisplayerWrapper } from './contact-group-displayer-wrapper';
import { screen, setupTest, within } from '../../../carbonio-ui-commons/test/test-setup';
import { EMPTY_DISPLAYER_WITH_CONTACTS_HINT, TESTID_SELECTORS } from '../../../constants/tests';
import { addContactsToStore } from '../../../legacy/store/contacts';
import { buildContactGroup } from '../../../tests/model-builder';
import { CONTACT_GROUPS_PATH } from '../navigation';

describe('Contact groups displayer wrapper', () => {
	const contactGroup = buildContactGroup();
	const { parent, id } = contactGroup;

	// TODO: check this test as the empty displayer message does not make any sense
	it('should show empty displayer if no contact group is active but there are contacts groups in the store', async () => {
		setupTest(<ContactGroupDisplayerWrapper />, {
			initialEntries: [`/folder/${parent}`],
			path: `/folder/:folderId/:type?/:id?`
		});
		const emptyDisplayerMessage = await screen.findByText(EMPTY_DISPLAYER_WITH_CONTACTS_HINT);
		expect(emptyDisplayerMessage).toBeVisible();
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer })
		).not.toBeInTheDocument();
	});

	it('should show contact group details if a contact group is active', () => {
		addContactsToStore([contactGroup]);
		setupTest(<ContactGroupDisplayerWrapper />, {
			initialEntries: [`/folder/${parent}/${CONTACT_GROUPS_PATH}/${id}`],
			path: `/folder/:folderId/:type?/:id?`
		});

		expect(
			within(screen.getByTestId(TESTID_SELECTORS.displayerHeader)).getByText(contactGroup.title)
		).toBeVisible();
	});
});
