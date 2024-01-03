/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import App from './app';
import { setupTest } from './carbonio-ui-commons/test/test-setup';
import { ContactInputProps } from './legacy/integrations/contact-input';
import { ContactInputIntegrationWrapper } from './legacy/integrations/contact-input-integration-wrapper';

describe('App', () => {
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
