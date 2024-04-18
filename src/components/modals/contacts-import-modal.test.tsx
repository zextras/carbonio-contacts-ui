/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ContactsImportModal } from './contacts-import-modal';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../legacy/tests/generators/store';
/**
 * Test the import contacts modal
 */

const defaultProps = {
	confirmCallback: jest.fn(),
	closeCallback: jest.fn(),
	fileName: 'testFile.csv',
	folderName: 'Test Folder'
};
const confirmButtonLabel = 'Import';
const closeIconRegex = /icon: CloseOutline/i;

describe('Import contacts modal', () => {
	it('the component renders all parts', async () => {
		const store = generateStore();
		const expectedTitle = 'Import contacts';
		const expectedBodyText = `The contacts contained within the specified ${defaultProps.fileName} file will be imported into "${defaultProps.folderName}" folder`;
		setupTest(<ContactsImportModal {...defaultProps} />, { store });
		expect(screen.getByText(expectedTitle)).toBeVisible();
		expect(screen.getByText(expectedBodyText)).toBeVisible();
		const confirmButton = screen.getByRole('button', {
			name: confirmButtonLabel
		});
		const closeButton = screen.getByRoleWithIcon('button', { icon: closeIconRegex });
		expect(confirmButton).toBeEnabled();
		expect(closeButton).toBeEnabled();
	});

	it('calls confirmCallback when the confirm button is pressed', async () => {
		const store = generateStore();
		const { user } = setupTest(<ContactsImportModal {...defaultProps} />, { store });
		const confirmButton = screen.getByRole('button', {
			name: confirmButtonLabel
		});
		await user.click(confirmButton);
		expect(defaultProps.confirmCallback).toHaveBeenCalled();
	});

	it('calls the closeCallback when the close modal button is pressed', async () => {
		const store = generateStore();
		const { user } = setupTest(<ContactsImportModal {...defaultProps} />, { store });

		const closeButton = screen.getByRoleWithIcon('button', { icon: closeIconRegex });
		await user.click(closeButton);
		expect(defaultProps.closeCallback).toHaveBeenCalled();
	});
});
