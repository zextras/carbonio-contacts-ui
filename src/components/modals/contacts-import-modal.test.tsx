/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { JSNS } from '@zextras/carbonio-shell-ui';

import { ContactsImportModal, ContactsImportModalProps } from './contacts-import-modal';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { generateFolder } from '../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { createFakeFile } from '../../carbonio-ui-commons/test/mocks/utils/file';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { ImportContactsRequest, ImportContactsResponse } from '../../network/api/import-contacts';
import { UploadResponseFileInfo } from '../../network/api/upload';
import { registerUploadHandler } from '../../tests/msw-handlers/upload';
/**
 * Test the import contacts modal
 */

const confirmButtonLabel = 'Import';

describe('Import contacts modal', () => {
	const defaultProps: ContactsImportModalProps = {
		closeCallback: jest.fn(),
		file: createFakeFile({ name: 'testFile.csv' }),
		addressBook: generateFolder({
			n: 15,
			view: FOLDER_VIEW.contact
		})
	};

	it('the component renders all parts', async () => {
		const expectedTitle = 'Import contacts';
		const expectedBodyText = `The contacts contained within the specified ${defaultProps.file.name} file will be imported into "${defaultProps.addressBook.name}" folder`;
		setupTest(<ContactsImportModal {...defaultProps} />);
		expect(screen.getByText(expectedTitle)).toBeVisible();
		expect(screen.getByText(expectedBodyText)).toBeVisible();
		const confirmButton = screen.getByRole('button', {
			name: confirmButtonLabel
		});
		const closeButton = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		expect(confirmButton).toBeEnabled();
		expect(closeButton).toBeEnabled();
	});

	it('calls ImportContact API when the confirm button is pressed', async () => {
		const fileInfo: UploadResponseFileInfo[2][number] = {
			aid: faker.string.uuid(),
			filename: faker.system.fileName(),
			ct: faker.system.mimeType(),
			s: faker.number.int()
		};

		// Register handler for the file upload API
		const uploadResponse = `200, "null", [${JSON.stringify(fileInfo)}]`;
		registerUploadHandler(uploadResponse);

		// Register handler for import contacts API
		const apiInterceptor = createSoapAPIInterceptor<ImportContactsRequest>('ImportContacts');
		const { user } = setupTest(<ContactsImportModal {...defaultProps} />);
		const confirmButton = screen.getByRole('button', {
			name: confirmButtonLabel
		});
		await act(async () => user.click(confirmButton));
		const importParams = await apiInterceptor;
		expect(importParams).toEqual(expect.objectContaining({ content: { aid: fileInfo.aid } }));
	});

	it('calls the closeCallback when the close modal button is pressed', async () => {
		const fileInfo: UploadResponseFileInfo[2][number] = {
			aid: faker.string.uuid(),
			filename: faker.system.fileName(),
			ct: faker.system.mimeType(),
			s: faker.number.int()
		};

		// Register handler for the file upload API
		const uploadResponse = `200, "null", [${JSON.stringify(fileInfo)}]`;
		registerUploadHandler(uploadResponse);

		// Register handler for import contacts API
		const importResponse: ImportContactsResponse = {
			cn: [
				{
					n: 1,
					ids: '8374'
				}
			],
			_jsns: JSNS.mail
		};
		createSoapAPIInterceptor<ImportContactsRequest, ImportContactsResponse>(
			'ImportContacts',
			importResponse
		);

		const onClose = jest.fn();
		const { user } = setupTest(<ContactsImportModal {...defaultProps} closeCallback={onClose} />);
		const confirmButton = screen.getByRole('button', {
			name: confirmButtonLabel
		});
		await act(async () => user.click(confirmButton));
		expect(onClose).toHaveBeenCalled();
	});

	it.todo(
		'should display a success snackbar with the number of imported contacts if the import succeeded'
	);

	it.todo('should display an error snackbar if the upload fails');

	it.todo('should display an error snackbar if the import fails');
});
