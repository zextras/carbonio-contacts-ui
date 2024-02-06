/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { FOLDERS_DESCRIPTORS } from '../constants/tests';
import {
	Contact,
	ContactAddress,
	ContactAddressType,
	ContactPhoneType,
	ContactUrlType
} from '../legacy/types/contact';
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

export const buildAddress = ({
	type = ContactAddressType.HOME,
	street = faker.location.streetAddress(),
	city = faker.location.city(),
	postalCode = faker.location.zipCode(),
	country = faker.location.country(),
	state = faker.location.state()
}: Partial<ContactAddress> = {}): ContactAddress => ({
	type,
	street,
	city,
	postalCode,
	country,
	state
});

export const buildContact = ({
	_id = faker.string.uuid(),
	id = faker.number.int().toString(),
	tags = times(3, () => faker.word.noun()),
	firstName = faker.person.firstName(),
	middleName = faker.person.middleName(),
	lastName = faker.person.lastName(),
	nickName = faker.word.noun(),
	parent = FOLDERS_DESCRIPTORS.contacts.id,
	address = {
		[ContactAddressType.HOME]: buildAddress({ type: ContactAddressType.HOME }),
		[ContactAddressType.WORK]: buildAddress({ type: ContactAddressType.WORK }),
		[ContactAddressType.OTHER]: buildAddress({ type: ContactAddressType.OTHER })
	},
	company = faker.company.name(),
	department = faker.commerce.department(),
	email = {
		email: { mail: faker.internet.email() },
		email2: { mail: faker.internet.email() },
		email3: { mail: faker.internet.email() }
	},
	image = '',
	jobTitle = faker.person.jobTitle(),
	notes = faker.word.preposition(),
	phone = {
		[ContactPhoneType.HOME]: { type: ContactPhoneType.HOME, number: faker.phone.number() },
		[ContactPhoneType.MOBILE]: { type: ContactPhoneType.MOBILE, number: faker.phone.number() },
		[ContactPhoneType.WORK]: { type: ContactPhoneType.WORK, number: faker.phone.number() },
		[ContactPhoneType.OTHER]: { type: ContactPhoneType.OTHER, number: faker.phone.number() }
	},
	nameSuffix = faker.person.suffix(),
	namePrefix = faker.person.prefix(),
	URL = {
		[ContactUrlType.HOME]: { type: ContactUrlType.HOME, url: faker.internet.url() },
		[ContactUrlType.WORK]: { type: ContactUrlType.WORK, url: faker.internet.url() },
		[ContactUrlType.OTHER]: { type: ContactUrlType.OTHER, url: faker.internet.url() }
	},
	fileAsStr = undefined
}: Partial<Contact> = {}): Contact => ({
	_id,
	id,
	tags,
	firstName,
	middleName,
	lastName,
	nickName,
	parent,
	address,
	company,
	department,
	email,
	image,
	jobTitle,
	notes,
	phone,
	nameSuffix,
	namePrefix,
	URL,
	fileAsStr: fileAsStr || `8:${firstName} ${lastName}`
});
