/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { SharesModal } from './shares-modal';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';

describe('SharesModal', () => {
	it('should render the modal with the specific title', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		expect(screen.getByText('Find Contact Shares')).toBeVisible();
	});

	it('should render a close icon button on the header', () => {
		const onClose = jest.fn();
		setupTest(<SharesModal onClose={onClose} />, {});

		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it.todo('should render a button to add the selected shares');

	it.todo('should render a filter field with a placeholder text and an icon');

	it.todo('should render a hint description');

	it.todo('should render a list of users that shares some addressbooks');

	describe('"Add" button', () => {
		it.todo('should be disabled when the modal opens');

		it.todo('should be enabled if the user select at least one shared addressbook');

		it.todo('should be disabled if there is no selected addressbook');

		it.todo('should call the createMountpoint action if the user click the "add" button');

		it.todo('should close the modal if the createMountpoint action results in success');
	});
});
