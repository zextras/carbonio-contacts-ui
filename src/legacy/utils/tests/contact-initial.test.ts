/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Contact } from 'legacy/types/contact';
import {
	getContactInitial,
	getContactSortValue,
	OTHER_INITIAL
} from 'legacy/utils/contact-initial';
import { ContactGroup } from 'model/contact-group';

const buildContact = (overrides: Partial<Contact> = {}): Contact =>
	({
		id: '1',
		parent: '7',
		firstName: '',
		middleName: '',
		lastName: '',
		nickName: '',
		displayName: '',
		email: {},
		...overrides
	}) as Contact;

const buildGroup = (title: string): ContactGroup => ({
	id: 'g1',
	parent: '7',
	members: [],
	title
});

describe('getContactSortValue', () => {
	it('should return the displayName when it is set, ignoring the name parts', () => {
		const contact = buildContact({
			displayName: 'Zorro',
			firstName: 'Alice',
			lastName: 'Tincani'
		});
		expect(getContactSortValue(contact)).toBe('Zorro');
	});

	it('should join firstName and lastName when the displayName is empty', () => {
		const contact = buildContact({ firstName: 'Alice', lastName: 'Tincani' });
		expect(getContactSortValue(contact)).toBe('Alice Tincani');
	});

	it('should fall back to the lastName when the firstName is empty', () => {
		const contact = buildContact({ lastName: 'Tincani' });
		expect(getContactSortValue(contact)).toBe('Tincani');
	});

	it('should fall back to the primary email, without the no-name decoration', () => {
		const contact = buildContact({
			email: { email: { mail: 'brenda@marshall.com' } }
		});
		expect(getContactSortValue(contact)).toBe('brenda@marshall.com');
	});

	it('should return an empty string when the contact has no usable field', () => {
		expect(getContactSortValue(buildContact())).toBe('');
	});

	it('should return the title of a contact group', () => {
		expect(getContactSortValue(buildGroup('Marketing'))).toBe('Marketing');
	});
});

describe('getContactInitial', () => {
	it('should return the upper cased first letter of the display value', () => {
		expect(getContactInitial(buildContact({ displayName: 'alice' }))).toBe('A');
	});

	it('should strip diacritics', () => {
		expect(getContactInitial(buildContact({ firstName: 'Émile' }))).toBe('E');
		expect(getContactInitial(buildContact({ firstName: 'Ångström' }))).toBe('A');
	});

	it('should ignore leading whitespace', () => {
		expect(getContactInitial(buildContact({ displayName: '  Bob' }))).toBe('B');
	});

	it('should bucket non latin initials under the other section', () => {
		expect(getContactInitial(buildContact({ displayName: 'Иванов' }))).toBe(OTHER_INITIAL);
		expect(getContactInitial(buildContact({ displayName: '田中' }))).toBe(OTHER_INITIAL);
	});

	it('should bucket digits and symbols under the other section', () => {
		expect(getContactInitial(buildContact({ displayName: '3M' }))).toBe(OTHER_INITIAL);
		expect(getContactInitial(buildContact({ displayName: '_internal' }))).toBe(OTHER_INITIAL);
	});

	it('should bucket contacts with no usable field under the other section', () => {
		expect(getContactInitial(buildContact())).toBe(OTHER_INITIAL);
	});

	it('should use the email initial when there is no name', () => {
		const contact = buildContact({ email: { email: { mail: 'brenda@marshall.com' } } });
		expect(getContactInitial(contact)).toBe('B');
	});

	it('should use the title initial for a contact group', () => {
		expect(getContactInitial(buildGroup('marketing'))).toBe('M');
	});
});
