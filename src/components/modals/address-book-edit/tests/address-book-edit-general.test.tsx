/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { AddressBookEditGeneralModal } from 'components/modals/address-book-edit/address-book-edit-general';
import { setupTest } from '@test-setup';

describe('AddressBookEditGeneralModal', () => {
	it('should render an empty modal title when the address book does not exist', () => {
		setupTest(
			<AddressBookEditGeneralModal
				addressBookId="non-existing-id"
				onClose={jest.fn()}
				onAddShare={jest.fn()}
				onEditShare={jest.fn()}
				onRevokeShare={jest.fn()}
			/>
		);

		const modalTitle = screen.getByText(/Edit 's properties/i);
		expect(modalTitle).toBeVisible();
	});
});
