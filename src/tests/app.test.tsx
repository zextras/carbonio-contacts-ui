/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';
import { ContactInputProps } from '@zextras/carbonio-ui-commons';
import { HttpResponse } from 'msw';
import { vi } from 'vitest';

import { setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';
import App from 'app';
import { CONTACT_BOARD_ID } from 'constants/index';
import { ContactInput } from 'legacy/integrations/contact-input';

describe('App', () => {
	beforeEach(() => {
		createAPIInterceptor('get', 'zx/login/v3/account', HttpResponse.json({}));
		createSoapAPIInterceptor('GetFolder', {
			folder: [generateFolder({ name: 'Inbox' })]
		});
		createSoapAPIInterceptor('GetShareInfo', { result: { share: [] } });
	});

	it('should register a "contacts" route accessible from the primary bar with specific position, name and icon', () => {
		const addRoute = vi.spyOn(shell, 'addRoute');
		setupTest(<App />);

		expect(addRoute).toHaveBeenCalledWith<Parameters<typeof shell.addRoute>>(
			expect.objectContaining({
				route: 'contacts',
				position: 300,
				visible: true,
				label: 'Contacts',
				primaryBar: 'ContactsModOutline'
			})
		);
	});

	it('should register a "groups" route accessible from the primary bar with specific position, name and icon', () => {
		const addRoute = vi.spyOn(shell, 'addRoute');
		setupTest(<App />);

		expect(addRoute).toHaveBeenCalledWith<Parameters<typeof shell.addRoute>>(
			expect.objectContaining({
				route: 'groups',
				position: 310,
				visible: true,
				label: 'Distribution Lists',
				primaryBar: 'ListOutline'
			})
		);
	});

	it('should register a settings view', () => {
		const addSettingsView = vi.spyOn(shell, 'addSettingsView');
		setupTest(<App />);
		expect(addSettingsView).toHaveBeenCalledWith<Parameters<typeof shell.addSettingsView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should register a board view to edit a contact', () => {
		const addBoardView = vi.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: CONTACT_BOARD_ID,
			component: expect.anything()
		});
	});

	it('should register a board view to create a contacts group', () => {
		const addBoardView = vi.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'new-contact-group-board',
			component: expect.anything()
		});
	});

	it('should register a board view to edit a contacts group', () => {
		const addBoardView = vi.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'edit-contact-group-board',
			component: expect.anything()
		});
	});

	it('should register a board view to edit a distribution list', () => {
		const addBoardView = vi.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'edit-dl-board',
			component: expect.anything()
		});
	});

	it('should register a contact-input component', async () => {
		const registerComponents = vi.spyOn(shell, 'registerComponents');
		setupTest(<App />);
		expect(registerComponents).toHaveBeenCalledWith<
			Parameters<typeof shell.registerComponents<ContactInputProps>>
		>({
			id: 'contact-input',
			component: ContactInput
		});
	});
});
