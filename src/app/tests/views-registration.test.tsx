/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import type * as SearchUI from '@zextras/carbonio-search-ui';
import { addBoardView, addRoute, addSettingsView } from '@zextras/carbonio-shell-ui';
import * as shell from '@zextras/carbonio-shell-ui';

import App from '../../app';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import {
	CONTACT_BOARD_ID,
	CONTACTS_APP_ID,
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
		const addSearchView = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockImplementation((id) => {
			if (id === 'search-add-view') {
				return [addSearchView, true];
			}
			return [jest.fn(), false];
		});
		setupTest(<ViewsRegistration />);
		expect(addSearchView).toHaveBeenCalledWith<Parameters<typeof SearchUI.addSearchView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should remove the search view on unmount', () => {
		const addSearchView = jest.fn();
		const removeSearchView = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockImplementation((id) => {
			if (id === 'search-add-view') {
				return [addSearchView, true];
			}
			if (id === 'search-remove-view') {
				return [removeSearchView, true];
			}
			return [jest.fn(), false];
		});
		const { unmount } = setupTest(<App />);

		unmount();

		expect(removeSearchView).toHaveBeenCalledWith<Parameters<typeof SearchUI.removeSearchView>>(
			CONTACTS_APP_ID
		);
	});

	it('should register the contact board view', () => {
		setupTest(<ViewsRegistration />);

		expect(addBoardView).toHaveBeenCalledWith({
			id: CONTACT_BOARD_ID,
			component: expect.any(Function)
		});
	});

	it('should register upsertApp', () => {
		const upsertApp = jest.spyOn(shell, 'upsertApp');
		setupTest(<ViewsRegistration />);
		expect(upsertApp).toHaveBeenCalledWith<Parameters<typeof shell.upsertApp>>({
			name: CONTACTS_APP_ID,
			display: 'Contacts'
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
