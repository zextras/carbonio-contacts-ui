/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { upload } from './upload';
import { createFakeFile } from '../../carbonio-ui-commons/test/mocks/utils/file';
import { registerUploadHandler } from '../../tests/msw-handlers/upload';

describe('Upload', () => {
	it('should raise an exception if the response is not valid', () => {
		registerUploadHandler();
		expect(async () => {
			await upload(createFakeFile());
		}).rejects.toThrow();
	});

	it('should raise an exception if the response is empty', () => {
		const response = '200, "null", []';
		registerUploadHandler(response);
		expect(async () => {
			await upload(createFakeFile());
		}).rejects.toThrow();
	});

	it('should return the normalized response', () => {
		const fileInfo = {
			aid: faker.string.uuid(),
			s: faker.number.int(),
			ct: faker.system.mimeType(),
			filename: faker.system.fileName()
		};
		const response = `200, "null", [${JSON.stringify(fileInfo)}]`;
		registerUploadHandler(response);

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(upload(createFakeFile())).resolves.toEqual(
			expect.arrayContaining([
				{
					aid: fileInfo.aid,
					size: fileInfo.s,
					contentType: fileInfo.ct,
					fileName: fileInfo.filename
				}
			])
		);
	});
});
