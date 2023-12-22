/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { ContactInput } from './contact-input';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../tests/generators/store';

const contactChipItem = {
	email: faker.internet.email()
};

describe('Contact input', () => {
	it('should call onChange with the new chip to create', async () => {
		const store = generateStore();
		const onChange = jest.fn();
		const { user } = setupTest(
			<ContactInput defaultValue={[]} placeholder={''} extraAccountsIds={[]} onChange={onChange} />,
			{
				store
			}
		);

		await user.type(screen.getByRole('textbox'), contactChipItem.email);
		await act(async () => {
			await user.type(screen.getByRole('textbox'), ',');
		});
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({
				email: contactChipItem.email,
				id: expect.anything(),
				label: contactChipItem.email,
				error: false
			})
		]);
	});
});
