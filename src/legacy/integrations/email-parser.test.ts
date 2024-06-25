/* eslint-disable sonarjs/no-duplicate-string */
import { emailParser } from './email-parser';

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('mail-parser can parse', () => {
	it('empty string is invalid', () => {
		const parsed = emailParser().parseEmail('');
		expect(parsed).toStrictEqual({
			id: '',
			error: true,
			label: '',
			email: ''
		});
	});

	it('valid email', () => {
		const parsed = emailParser().parseEmail('dan@email.it');
		expect(parsed).toStrictEqual({
			id: 'dan@email.it',
			error: false,
			label: 'dan@email.it',
			email: 'dan@email.it'
		});
	});

	it('valid email with name', () => {
		const parsed = emailParser().parseEmail('"Daniele" <daniele@email.it>');
		expect(parsed).toStrictEqual({
			id: 'daniele@email.it',
			error: false,
			label: 'daniele@email.it',
			email: 'daniele@email.it'
		});
	});

	it('invalid string has error flag', () => {
		const parser = emailParser().parseEmail;
		expect(parser('invalid')).toStrictEqual({
			id: 'invalid',
			error: true,
			label: 'invalid',
			email: 'invalid'
		});
		expect(parser('other@invalid')).toStrictEqual({
			id: 'other@invalid',
			error: true,
			label: 'other@invalid',
			email: 'other@invalid'
		});
		expect(parser('@invalid.it')).toStrictEqual({
			id: '@invalid.it',
			error: true,
			label: '@invalid.it',
			email: '@invalid.it'
		});
		expect(parser('"Invalid" <invalid>')).toStrictEqual({
			id: 'invalid',
			error: true,
			label: 'invalid',
			email: 'invalid'
		});
		expect(parser('"Another" <another@invalid>')).toStrictEqual({
			id: 'another@invalid',
			error: true,
			label: 'another@invalid',
			email: 'another@invalid'
		});
	});
});
