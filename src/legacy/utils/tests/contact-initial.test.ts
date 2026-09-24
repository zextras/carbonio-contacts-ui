/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Contact } from 'legacy/types/contact';
import { getContactInitial, OTHER_INITIAL } from 'legacy/utils/contact-initial';
import { ContactGroup } from 'model/contact-group';

const buildContact = (fileAsStr: string): Contact =>
	({
		id: '1',
		parent: '7',
		firstName: '',
		middleName: '',
		lastName: '',
		nickName: '',
		displayName: '',
		email: {},
		fileAsStr
	}) as Contact;

const buildGroup = (title: string): ContactGroup => ({
	id: 'g1',
	parent: '7',
	members: [],
	title
});

describe('getContactInitial', () => {
	it('should return the upper cased first letter of fileAsStr', () => {
		expect(getContactInitial(buildContact('alice tincani'))).toBe('A');
	});

	it('should strip diacritics', () => {
		expect(getContactInitial(buildContact('Émile'))).toBe('E');
		expect(getContactInitial(buildContact('Ångström'))).toBe('A');
	});

	it('should ignore leading whitespace', () => {
		expect(getContactInitial(buildContact('  Bob'))).toBe('B');
	});

	it('should bucket non latin initials under the other section', () => {
		expect(getContactInitial(buildContact('Иванов'))).toBe(OTHER_INITIAL);
		expect(getContactInitial(buildContact('田中'))).toBe(OTHER_INITIAL);
	});

	it('should bucket digits and symbols under the other section', () => {
		expect(getContactInitial(buildContact('3M'))).toBe(OTHER_INITIAL);
		expect(getContactInitial(buildContact('_internal'))).toBe(OTHER_INITIAL);
	});

	it('should bucket a contact with an empty fileAsStr under the other section', () => {
		expect(getContactInitial(buildContact(''))).toBe(OTHER_INITIAL);
	});

	it('should use the title initial for a contact group', () => {
		expect(getContactInitial(buildGroup('marketing'))).toBe('M');
	});
});
