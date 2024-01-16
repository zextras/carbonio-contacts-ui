/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';

import { deleteContactAction } from './contact-action';
import { registerDeleteContactHandler } from '../../tests/msw-handlers/delete-contact';

it('Contact action', async () => {
	const id = faker.number.int({ min: 100, max: 999 });
	const handler = registerDeleteContactHandler(id.toString());
	await deleteContactAction([id.toString()]);
	expect(handler).toHaveBeenCalled();
});
