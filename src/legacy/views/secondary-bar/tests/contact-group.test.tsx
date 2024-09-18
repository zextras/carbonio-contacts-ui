/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { act, screen } from '@testing-library/react';
import * as shellUi from '@zextras/carbonio-shell-ui';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { MainAccountContactGroup } from '../main-account-contact-group';

describe('Contact Group Sidebar Item', () => {
	it('should redirect to /contacts/contact-groups when clicking on it', async () => {
		const spyReplaceHistory = jest.spyOn(shellUi, 'replaceHistory');
		const { user } = setupTest(<MainAccountContactGroup />);
		const contactGroupItem = screen.getByTestId('contact-group-id');

		await act(async () => {
			await user.click(contactGroupItem);
		});

		expect(spyReplaceHistory).toHaveBeenCalledWith('contact-groups');
	});
});
