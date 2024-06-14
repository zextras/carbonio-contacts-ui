/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { getItem } from './get-item';
import { registerGetItemHandler } from '../../tests/msw-handlers/get-item';

describe('getItem', () => {
	it('should call the Get Item API with the correct parameters', async () => {
		const id = faker.number.int().toString();
		const interceptor = registerGetItemHandler();
		getItem(id);
		const apiRequest = await interceptor;
		expect(apiRequest).toEqual({ id });
	});

	it('should throw an error if the API responds with a fault', () => {
		registerGetItemHandler({ error: true });
		expect(async () => {
			await getItem(faker.number.int().toString());
		}).rejects.toThrow();
	});

	it('should return the response of the API response if successful', async () => {
		const response = faker.string.alphanumeric(512);
		registerGetItemHandler({ response });
		await expect(getItem(faker.number.int().toString())).resolves.toEqual(response);
	});
});
