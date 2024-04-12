/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AddressBookDeleteModal } from './address-book-delete';
import { FOLDER_VIEW } from '../../../carbonio-ui-commons/constants';
import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';

describe('AddressBookDeleteModal', () => {
	it('should render a modal with a specific title', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(screen.getByText(`Delete ${addressBook.name}`)).toBeVisible();
	});

	it('should display a confirmation text', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		expect(
			screen.getByText('Do you want to delete permanently the selected address book', {
				exact: false
			})
		).toBeVisible();
	});

	it('should display a "delete" button, enabled and with a red background', () => {
		const addressBook = generateFolder({
			view: FOLDER_VIEW.contact
		});
		setupTest(<AddressBookDeleteModal addressBook={addressBook} onClose={jest.fn()} />);
		const button = screen.getByRole('button', { name: 'Delete' });
		expect(button).toBeEnabled();
		// FIXME
		// expect(button).toHaveStyleRule('backgroundColor', PALETTE.error.regular);
	});

	it.todo(
		'should call the API with the proper parameters if the user clicks on the "delete" button'
	);

	it.todo('should close the modal after a successful result from the API');

	it.todo("shouldn't close the modal if the API returns an error");
});
