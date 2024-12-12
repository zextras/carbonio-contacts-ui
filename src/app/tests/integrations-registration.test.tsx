/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	ACTION_TYPES,
	registerActions,
	registerComponents,
	registerFunctions
} from '@zextras/carbonio-shell-ui';

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

	it('should register the contact creation from vCard function', () => {
		setupTest(<IntegrationsRegistration />);

		expect(registerFunctions).toHaveBeenCalledWith({
			id: 'create_contact_from_vcard',
			fn: expect.any(Function)
		});
	});

	it('should register the actions', () => {
		setupTest(<IntegrationsRegistration />);

		expect(registerActions).toHaveBeenCalledWith(
			{
				id: 'new-contact',
				type: ACTION_TYPES.NEW,
				action: expect.any(Function)
			},
			{
				id: 'new-contact-group',
				type: ACTION_TYPES.NEW,
				action: expect.any(Function)
			}
		);
	});
});
