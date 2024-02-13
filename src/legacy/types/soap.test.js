/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ContactAddressType, ContactPhoneType, ContactUrlType } from './contact';
import {
	normalizeContactMailsToSoapOp,
	normalizeContactPhonesToSoapOp,
	normalizeContactAddressesToSoapOp,
	normalizeContactUrlsToSoapOp,
	normalizeContactToSoap // todo: make new test normalizations
} from '../utils/normalizations/normalize-contact-to-soap';

describe('SOAP Utils', () => {
	test('Normalize Contact Mails for SOAP Operation', () => {
		expect(
			normalizeContactMailsToSoapOp({
				mail: { mail: 'mail@example.com' },
				mail2: { mail: 'mail1@example.com' },
				mail3: { mail: 'mail2@example.com' }
			})
		).toStrictEqual({
			mail: 'mail@example.com',
			mail2: 'mail1@example.com',
			mail3: 'mail2@example.com'
		});
	});

	test('Normalize Contact Phones for SOAP Operation', () => {
		expect(
			normalizeContactPhonesToSoapOp({
				otherPhone: { number: 'otherPhone', type: ContactPhoneType.OTHER },
				otherPhone2: { number: 'otherPhone2', type: ContactPhoneType.OTHER },
				otherPhone3: { number: 'otherPhone3', type: ContactPhoneType.OTHER },
				mobilePhone: { number: 'mobilePhone', type: ContactPhoneType.MOBILE },
				homePhone: { number: 'homePhone', type: ContactPhoneType.HOME },
				workPhone: { number: 'workPhone', type: ContactPhoneType.WORK }
			})
		).toStrictEqual({
			otherPhone: 'otherPhone',
			otherPhone2: 'otherPhone2',
			otherPhone3: 'otherPhone3',
			mobilePhone: 'mobilePhone',
			homePhone: 'homePhone',
			workPhone: 'workPhone'
		});
	});

	test('Normalize Contact Urls for SOAP Operation', () => {
		expect(
			normalizeContactUrlsToSoapOp({
				otherUrl: { url: 'otherUrl', type: ContactUrlType.OTHER },
				otherUrl2: { url: 'otherUrl2', type: ContactUrlType.OTHER },
				otherUrl3: { url: 'otherUrl3', type: ContactUrlType.OTHER },
				homeUrl: { url: 'homeUrl', type: ContactUrlType.HOME },
				workUrl: { url: 'workUrl', type: ContactUrlType.WORK }
			})
		).toStrictEqual({
			otherUrl: 'otherUrl',
			otherUrl2: 'otherUrl2',
			otherUrl3: 'otherUrl3',
			homeUrl: 'homeUrl',
			workUrl: 'workUrl'
		});
	});

	test('Normalize Contact Addresses for SOAP Operation', () => {
		expect(
			normalizeContactAddressesToSoapOp({
				otherAddress: {
					street: 'otherStreet',
					postalCode: 'otherPostalCode',
					city: 'otherCity',
					state: 'otherState',
					country: 'otherCountry',
					type: ContactAddressType.OTHER
				},
				otherAddress2: {
					street: 'otherStreet2',
					postalCode: 'otherPostalCode2',
					city: 'otherCity2',
					state: 'otherState2',
					country: 'otherCountry2',
					type: ContactAddressType.OTHER
				},
				homeAddress: {
					street: 'homeStreet',
					postalCode: 'homePostalCode',
					city: 'homeCity',
					state: 'homeState',
					country: 'homeCountry',
					type: ContactAddressType.HOME
				},
				workAddress: {
					street: 'workStreet',
					postalCode: 'workPostalCode',
					city: 'workCity',
					state: 'workState',
					country: 'workCountry',
					type: ContactAddressType.WORK
				}
			})
		).toStrictEqual({
			otherStreet: 'otherStreet',
			otherPostalCode: 'otherPostalCode',
			otherCity: 'otherCity',
			otherState: 'otherState',
			otherCountry: 'otherCountry',
			otherStreet2: 'otherStreet2',
			otherPostalCode2: 'otherPostalCode2',
			otherCity2: 'otherCity2',
			otherState2: 'otherState2',
			otherCountry2: 'otherCountry2',
			homeStreet: 'homeStreet',
			homePostalCode: 'homePostalCode',
			homeCity: 'homeCity',
			homeState: 'homeState',
			homeCountry: 'homeCountry',
			workStreet: 'workStreet',
			workPostalCode: 'workPostalCode',
			workCity: 'workCity',
			workState: 'workState',
			workCountry: 'workCountry'
		});
	});
	test('Normalize Contact Attributes for SOAP Operation', () => {
		expect(
			normalizeContactToSoap({
				nameSuffix: 'nameSuffix',
				namePrefix: 'namePrefix',
				firstName: 'firstName',
				lastName: 'lastName',
				middleName: 'middleName',
				image: 'image',
				jobTitle: 'jobTitle',
				department: 'department',
				company: 'company',
				notes: 'notes',
				nickName: 'nickName',
				email: {
					email: {
						mail: 'mail@example.com'
					},
					email2: {
						mail: 'mail2@example.com'
					}
				},
				phone: {
					otherPhone: {
						type: ContactAddressType.OTHER,
						number: 'otherPhone'
					}
				},
				address: {
					otherAddress: {
						street: 'otherStreet',
						postalCode: 'otherPostalCode',
						city: 'otherCity',
						state: 'otherState',
						country: 'otherCountry',
						type: ContactAddressType.OTHER
					}
				},
				URL: {
					otherUrl: {
						url: 'otherUrl',
						type: ContactUrlType.OTHER
					}
				}
			})
		).toStrictEqual([
			{
				_content: 'nameSuffix',
				n: 'nameSuffix'
			},
			{
				_content: 'namePrefix',
				n: 'namePrefix'
			},
			{
				_content: 'firstName',
				n: 'firstName'
			},
			{
				_content: 'lastName',
				n: 'lastName'
			},
			{
				_content: 'middleName',
				n: 'middleName'
			},
			{
				_content: 'image',
				n: 'image'
			},
			{
				_content: 'jobTitle',
				n: 'jobTitle'
			},
			{
				_content: 'department',
				n: 'department'
			},
			{
				_content: 'company',
				n: 'company'
			},
			{
				_content: 'notes',
				n: 'notes'
			},
			{
				_content: 'nickName',
				n: 'nickname'
			},
			{
				_content: 'mail@example.com',
				n: 'email'
			},
			{
				_content: 'mail2@example.com',
				n: 'email2'
			},
			{
				_content: 'otherPhone',
				n: 'otherPhone'
			},
			{
				_content: 'otherStreet',
				n: 'otherStreet'
			},
			{
				_content: 'otherPostalCode',
				n: 'otherPostalCode'
			},
			{
				_content: 'otherCity',
				n: 'otherCity'
			},
			{
				_content: 'otherState',
				n: 'otherState'
			},
			{
				_content: 'otherCountry',
				n: 'otherCountry'
			},
			{
				_content: 'otherUrl',
				n: 'otherUrl'
			}
		]);
	});
});
