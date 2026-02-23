/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import type * as SearchUI from '@zextras/carbonio-search-ui';
import {
	addBoardView,
	addRoute,
	addSettingsView,
	useIntegratedFunction,
	upsertApp
} from '@zextras/carbonio-shell-ui';
import { Mock, vi } from 'vitest';

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
import { setupTest } from '@test-setup';

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
		const SEARCH_ADD_VIEW = 'search-add-view';
		const addSearchView = vi.fn();
		(useIntegratedFunction as Mock).mockImplementation((id: string) => [
			id === SEARCH_ADD_VIEW ? addSearchView : vi.fn(),
			id === SEARCH_ADD_VIEW
		]);
		setupTest(<ViewsRegistration />);
		expect(addSearchView).toHaveBeenCalledWith<Parameters<typeof SearchUI.addSearchView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should remove the search view on unmount', () => {
		const SEARCH_ADD_VIEW = 'search-add-view';
		const SEARCH_REMOVE_VIEW = 'search-remove-view';
		const addSearchView = vi.fn();
		const removeSearchView = vi.fn();
		(useIntegratedFunction as Mock).mockImplementation((id: string) => {
			let fn = vi.fn();
			if (id === SEARCH_ADD_VIEW) fn = addSearchView;
			if (id === SEARCH_REMOVE_VIEW) fn = removeSearchView;
			return [fn, id === SEARCH_ADD_VIEW || id === SEARCH_REMOVE_VIEW];
		});
		const { unmount } = setupTest(<ViewsRegistration />);

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
		setupTest(<ViewsRegistration />);
		expect(upsertApp).toHaveBeenCalledWith({
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
