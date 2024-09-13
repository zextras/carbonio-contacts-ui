/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import App from './app';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { CONTACT_BOARD_ID } from '../../constants';
import { ContactInputProps } from '../../legacy/integrations/contact-input';
import { ContactInputIntegrationWrapper } from '../../legacy/integrations/contact-input-integration-wrapper';

describe('App', () => {
	it('should register a "contacts" route accessible from the primary bar with specific position, name and icon', () => {
		const addRoute = jest.spyOn(shell, 'addRoute');
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
		const addRoute = jest.spyOn(shell, 'addRoute');
		setupTest(<App />);

		expect(addRoute).toHaveBeenCalledWith<Parameters<typeof shell.addRoute>>(
			expect.objectContaining({
				route: 'groups',
				position: 310,
				visible: true,
				label: 'Contact Groups and Distribution Lists',
				primaryBar: 'ListOutline'
			})
		);
	});

	it('should register a settings view', () => {
		const addSettingsView = jest.spyOn(shell, 'addSettingsView');
		setupTest(<App />);
		expect(addSettingsView).toHaveBeenCalledWith<Parameters<typeof shell.addSettingsView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should register a search view', () => {
		const addSearchView = jest.spyOn(shell, 'addSearchView');
		setupTest(<App />);
		expect(addSearchView).toHaveBeenCalledWith<Parameters<typeof shell.addSearchView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should register a search view', () => {
		const addSearchView = jest.spyOn(shell, 'addSearchView');
		setupTest(<App />);
		expect(addSearchView).toHaveBeenCalledWith<Parameters<typeof shell.addSearchView>>(
			expect.objectContaining({
				route: 'contacts',
				label: 'Contacts'
			})
		);
	});

	it('should register a board view to edit a contact', () => {
		const addBoardView = jest.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: CONTACT_BOARD_ID,
			component: expect.anything()
		});
	});

	it('should register a board view to create a contacts group', () => {
		const addBoardView = jest.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'new-contact-group-board',
			component: expect.anything()
		});
	});

	it('should register a board view to edit a contacts group', () => {
		const addBoardView = jest.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'edit-contact-group-board',
			component: expect.anything()
		});
	});

	it('should register a board view to edit a distribution list', () => {
		const addBoardView = jest.spyOn(shell, 'addBoardView');
		setupTest(<App />);
		expect(addBoardView).toHaveBeenCalledWith<Parameters<typeof shell.addBoardView>>({
			id: 'edit-dl-board',
			component: expect.anything()
		});
	});

	it('should register a contact-input component', async () => {
		const registerComponents = jest.spyOn(shell, 'registerComponents');
		setupTest(<App />);
		expect(registerComponents).toHaveBeenCalledWith<
			Parameters<typeof shell.registerComponents<ContactInputProps>>
		>({
			id: 'contact-input',
			component: ContactInputIntegrationWrapper
		});
	});
});
