/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	lowerFirst,
	parseInt,
	pickBy,
	reduce,
	words,
	isEmpty,
	omitBy,
	isNil,
	filter
} from 'lodash';

import {
	Contact,
	ContactAddress,
	ContactAddressMap,
	ContactAddressType,
	ContactEmailMap,
	ContactPhoneMap,
	ContactPhoneType,
	ContactUrlMap,
	ContactUrlType
} from '../../types/contact';
import { SoapContact } from '../../types/soap';

const MAIL_REG = /^email(\d*)$/;
const PHONE_REG = /^(.*)Phone(\d*)$/;
const URL_REG = /^(.*)URL(\d*)$/;
const ADDR_PART_REG = /^(.*)(City|Country|PostalCode|State|Street)(\d*)$/;

function contactPhoneTypeFromString(s: string): ContactPhoneType {
	if (!PHONE_REG.test(s)) return ContactPhoneType.OTHER;
	switch (s.match(PHONE_REG)?.[1]) {
		case 'mobile':
			return ContactPhoneType.MOBILE;
		case 'work':
			return ContactPhoneType.WORK;
		case 'home':
			return ContactPhoneType.HOME;
		default:
			return ContactPhoneType.OTHER;
	}
}

function contactUrlTypeFromString(s: string): ContactUrlType {
	if (!URL_REG.test(s)) return ContactUrlType.OTHER;
	switch (s.match(URL_REG)?.[1]) {
		case 'work':
			return ContactUrlType.WORK;
		case 'home':
			return ContactUrlType.HOME;
		default:
			return ContactUrlType.OTHER;
	}
}

function getParts(key: string): [ContactAddressType, keyof ContactAddress, number] {
	const [type, subType, index, opt]: string[] = words(key);
	return [
		type as ContactAddressType,
		lowerFirst(subType === 'Postal' ? 'postalCode' : subType) as keyof ContactAddress,
		parseInt(index === 'Code' ? opt : index) || 1
	];
}

function normalizeContactAddresses(c: SoapContact): ContactAddressMap {
	return reduce(
		c._attrs as { [k: string]: string },
		(r: { [id: string]: ContactAddress }, attr: string, key) => {
			if (ADDR_PART_REG.test(key)) {
				const [type, subType, index] = getParts(key);
				const id = `${type}Address${index > 1 ? index : ''}`;
				if (typeof r[id] === 'undefined') {
					r[id] = { [subType]: attr, type };
				} else {
					r[id] = { ...r[id], [subType]: attr };
				}
			}
			return r;
		},
		{}
	);
}

function normalizeContactMails(c: SoapContact): ContactEmailMap {
	return reduce(
		pickBy<string>(c._attrs, (v, k) => MAIL_REG.test(k)),
		(acc, v, k) => ({
			...acc,
			[k]: {
				mail: v
			}
		}),
		{}
	);
}

function normalizeContactPhones(c: SoapContact): ContactPhoneMap {
	return reduce(
		pickBy<string>(c._attrs, (v, k) => PHONE_REG.test(k)),
		(acc, v, k) => ({
			...acc,
			[k]: {
				number: v,
				type: contactPhoneTypeFromString(k)
			}
		}),
		{}
	);
}

function normalizeContactUrls(c: SoapContact): ContactUrlMap {
	return reduce(
		pickBy<string>(c._attrs, (v, k) => URL_REG.test(k)),
		(acc, v, k) => ({
			...acc,
			[k]: {
				url: v,
				type: contactUrlTypeFromString(k)
			}
		}),
		{}
	);
}

export function normalizeContactsFromSoap(contact: SoapContact[]): Contact[] | undefined {
	return isEmpty(contact)
		? undefined
		: reduce(
				contact || [],
				(r, c) => {
					if (c._attrs?.type === 'group') return r;
					r.push({
						parent: c.l,
						id: c.id,
						fileAsStr: c.fileAsStr,
						tags: !isNil(c.t) ? filter(c.t.split(','), (t) => t !== '') : [],
						address: normalizeContactAddresses(c),
						company: c._attrs?.company ?? '',
						department: c._attrs?.department ?? '',
						displayName: c._attrs?.displayName ?? '',
						email: normalizeContactMails(c),
						firstName: c._attrs?.firstName ?? c._attrs?.givenName ?? '',
						middleName: c._attrs?.middleName ?? '',
						lastName: c._attrs?.lastName ?? '',
						nickName: c._attrs?.nickname ?? '',
						image: c._attrs?.image
							? `/service/home/~/?auth=co&id=${c.id}&part=${c._attrs.image.part}&max_width=32&max_height=32`
							: '',
						jobTitle: c._attrs?.jobTitle ?? '',
						notes: c._attrs?.notes ?? '',
						phone: normalizeContactPhones(c),
						nameSuffix: c._attrs?.nameSuffix ?? '',
						namePrefix: c._attrs?.namePrefix ?? '',
						URL: normalizeContactUrls(c)
					});
					return r;
				},
				[] as Contact[]
			);
}

export function normalizeSyncContactsFromSoap(
	contact: SoapContact[]
): Array<Partial<Contact>> | undefined {
	return isEmpty(contact)
		? undefined
		: reduce(
				contact,
				(r, c) => {
					if (c._attrs?.type === 'group') return r;
					r.push(
						omitBy<Partial<Contact>>(
							{
								parent: c.l,
								id: c.id,
								tags: !isNil(c.t) ? filter(c.t.split(','), (t) => t !== '') : [],
								fileAsStr: c.fileAsStr,
								address: c._attrs ? normalizeContactAddresses(c) : undefined,
								company: c._attrs?.company,
								department: c._attrs?.department,
								displayName: c._attrs?.displayName,
								email: c._attrs ? normalizeContactMails(c) : undefined,
								firstName: c._attrs?.firstName || c._attrs?.givenName,
								middleName: c._attrs?.middleName,
								lastName: c._attrs?.lastName,
								nickName: c._attrs?.nickname,
								image: c._attrs?.image
									? `/service/home/~/?auth=co&id=${c.id}&part=${c._attrs.image.part}&max_width=32&max_height=32`
									: undefined,
								jobTitle: c._attrs?.jobTitle,
								notes: c._attrs?.notes,
								phone: c._attrs ? normalizeContactPhones(c) : undefined,
								nameSuffix: c._attrs?.nameSuffix,
								namePrefix: c._attrs?.namePrefix,
								URL: c._attrs ? normalizeContactUrls(c) : undefined
							},
							isNil
						)
					);
					return r;
				},
				[] as Array<Partial<Contact>>
			);
}
