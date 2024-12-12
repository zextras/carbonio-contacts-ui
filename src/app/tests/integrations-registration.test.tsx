/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { registerComponents } from '@zextras/carbonio-shell-ui';

import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { IntegrationsRegistration } from '../integrations-registration';

describe('IntegrationsRegistration', () => {
	it('should register the contact-input component', () => {
		setupTest(<IntegrationsRegistration />);

		expect(registerComponents).toHaveBeenCalledWith({
			id: 'contact-input',
			component: expect.any(Function)
		});
	});
});
