/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { addBoardView, addRoute, addSearchView, addSettingsView } from '@zextras/carbonio-shell-ui';

import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import {
	CONTACT_BOARD_ID,
	CONTACTS_ROUTE,
	EDIT_CONTACT_GROUP_BOARD_ID,
	EDIT_DL_BOARD_ID,
	GROUPS_ROUTE,
	NEW_CONTACT_GROUP_BOARD_ID
} from '../../constants';
import { ViewsRegistration } from '../views-registration';

describe('ViewsRegistration', () => {
	it('should register the main route', () => {
		setupTest(<ViewsRegistration />);

		expect(addRoute).toHaveBeenCalledWith({
			route: CONTACTS_ROUTE,
			position: 300,
			visible: true,
			label: 'Contacts',
			primaryBar: 'ContactsModOutline',
			secondaryBar: expect.any(Function),
			appView: expect.any(Function)
		});
	});

	it('should register the distribution lists route', () => {
		setupTest(<ViewsRegistration />);

		expect(addRoute).toHaveBeenCalledWith({
			route: GROUPS_ROUTE,
			position: 310,
			visible: true,
			label: 'Distribution Lists',
			primaryBar: 'ListOutline',
			secondaryBar: expect.any(Function),
			appView: expect.any(Function)
		});
	});

	it('should register the settings view', () => {
		setupTest(<ViewsRegistration />);

		expect(addSettingsView).toHaveBeenCalledWith({
			route: CONTACTS_ROUTE,
			label: 'Contacts',
			component: expect.any(Function)
		});
	});

	it('should register the search view', () => {
		setupTest(<ViewsRegistration />);

		expect(addSearchView).toHaveBeenCalledWith({
			route: CONTACTS_ROUTE,
			label: 'Contacts',
			component: expect.any(Function)
		});
	});

	it('should register the contact board view', () => {
		setupTest(<ViewsRegistration />);

		expect(addBoardView).toHaveBeenCalledWith({
			id: CONTACT_BOARD_ID,
			component: expect.any(Function)
		});
	});

	it('should register the contact group creation board views', () => {
		setupTest(<ViewsRegistration />);

		expect(addBoardView).toHaveBeenCalledWith({
			id: NEW_CONTACT_GROUP_BOARD_ID,
			component: expect.any(Function)
		});
	});

	it('should register the contact group editing board views', () => {
		setupTest(<ViewsRegistration />);

		expect(addBoardView).toHaveBeenCalledWith({
			id: EDIT_CONTACT_GROUP_BOARD_ID,
			component: expect.any(Function)
		});
	});

	it('should register the distribution list editing board views', () => {
		setupTest(<ViewsRegistration />);

		expect(addBoardView).toHaveBeenCalledWith({
			id: EDIT_DL_BOARD_ID,
			component: expect.any(Function)
		});
	});
});
