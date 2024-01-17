/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { ContactGroup } from '../model/contact-group';

export const buildContactGroup = ({
	title = faker.company.name(),
	id = faker.number.int({ min: 100 }).toString(),
	members = []
}: Partial<ContactGroup> = {}): ContactGroup => ({
	title,
	id,
	members
});

export function buildMembers(count: number): string[] {
	return times(count, () => faker.internet.email());
}
