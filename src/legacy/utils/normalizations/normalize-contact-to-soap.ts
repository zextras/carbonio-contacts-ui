/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map, merge, parseInt, pick, reduce } from 'lodash';

import {
	Contact,
	ContactAddress,
	ContactAddressMap,
	ContactEmailMap,
	ContactPhoneMap,
	ContactUrlMap
} from '../../types/contact';
import { CreateContactRequestAttr, ModifyContactRequestAttr } from '../../types/soap';

export function normalizeContactMailsToSoapOp(mails: ContactEmailMap): any {
	return reduce(
		mails,
		(c, v, k) => ({
			...c,
			[k]: v.mail
		}),
		{}
	);
}

export function normalizeContactPhonesToSoapOp(phones: ContactPhoneMap): any {
	return reduce(
		phones,
		(acc, v, k) =>
			k === 'type'
				? acc
				: {
						...acc,
						[k]: v.number
				  },
		{}
	);
}

export function normalizeContactUrlsToSoapOp(urls: ContactUrlMap): any {
	return reduce(
		urls,
		(acc, v, k) =>
			k === 'type'
				? acc
				: {
						...acc,
						[k]: v.url
				  },
		{}
	);
}

const capitalize: (l: string) => string = (lower) => lower.replace(/^\w/, (c) => c.toUpperCase());

const getKey: (k: string, v: ContactAddress, field: string) => string = (k, v, field) => {
	const index = k.match(/(\d+)$/);
	return `${v.type}${capitalize(field)}${index && index.length > 0 ? parseInt(index[0], 10) : ''}`;
};

export function normalizeContactAddressesToSoapOp(addresses: ContactAddressMap): any {
	return reduce(
		addresses,
		(acc, v, k) => ({
			...acc,
			...reduce(
				v,
				(acc2, v2, k2) =>
					k2 === 'type'
						? acc2
						: {
								...acc2,
								[getKey(k, v, k2)]: v2
						  },
				{}
			)
		}),
		{}
	);
}

export function normalizeContactToSoap(
	c: Contact
): Array<CreateContactRequestAttr | ModifyContactRequestAttr> {
	const obj: any = pick(c, [
		'nameSuffix',
		'namePrefix',
		'firstName',
		'lastName',
		'middleName',
		'image',
		'jobTitle',
		'department',
		'company',
		'notes'
	]);
	if (c.nickName) obj.nickname = c.nickName;
	if (c.email) merge(obj, normalizeContactMailsToSoapOp(c.email));
	if (c.phone) merge(obj, normalizeContactPhonesToSoapOp(c.phone));
	if (c.address) merge(obj, normalizeContactAddressesToSoapOp(c.address));
	if (c.URL) merge(obj, normalizeContactUrlsToSoapOp(c.URL));
	return map<any, any>(obj, (v: any, k: any) => ({ n: k, _content: v }));
}
