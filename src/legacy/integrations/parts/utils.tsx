/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { trim, unescape } from 'lodash';

import { parseEmail } from '../../../carbonio-ui-commons/helpers/email-parser';
import {
	ContactInputDistributionList,
	ContactInputGroup,
	ContactInputItem,
	ContactInputItemValue,
	USER_TYPES
} from '../../types/integrations';
import { NewContactGroup, NewDistributionList, RemoteContactResponse } from '../types';

export function isContactGroup(contact: {
	isGroup?: boolean;
	display?: string | null;
	email?: string;
}): contact is ContactInputGroup {
	return (
		(contact?.isGroup &&
			contact?.display !== undefined &&
			contact?.display !== null &&
			!contact?.email) ??
		false
	);
}

export const getContactId = (contact: ContactInputItemValue): string =>
	contact.type === USER_TYPES.GROUP ? contact.id : contact.email;

export const getChipLabel = (contact: ContactInputItemValue): string => {
	switch (contact.type) {
		case USER_TYPES.GROUP:
			return contact.display;
		case USER_TYPES.DISTRIBUTION_LIST:
			return contact.email;
		default:
			break;
	}

	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}

	return contact.fullName ?? contact.email;
};

export function tryToParseEmail(input: string | undefined): string {
	const inputOrDefault = unescape(input ?? '');
	return parseEmail(inputOrDefault) ?? inputOrDefault.trim();
}

export const isChipItemDistributionList = (
	contact: Pick<ContactInputItem, 'email' | 'isGroup'>
): contact is ContactInputDistributionList => (contact.isGroup && !!contact.email) ?? false;

export function newIsContactGroup(value: RemoteContactResponse): value is NewContactGroup {
	return 'isGroup' in value && !('email' in value) && value.isGroup;
}

export function newIsDistributionList(value: RemoteContactResponse): value is NewDistributionList {
	return 'isGroup' in value && 'email' in value && value.isGroup;
}

export const mapToContactInputItem = (value: RemoteContactResponse): ContactInputItemValue => {
	if (newIsContactGroup(value)) {
		return {
			id: value.id,
			display: value.display,
			groupId: value.id,
			type: USER_TYPES.GROUP
		};
	}
	const parsedEmail = tryToParseEmail(value.email);
	if (newIsDistributionList(value)) {
		return {
			id: parsedEmail,
			email: parsedEmail,
			type: USER_TYPES.DISTRIBUTION_LIST
		};
	}
	return {
		id: parsedEmail,
		firstName: value.first,
		lastName: value.last,
		middleName: value.middle,
		fullName: value.full,
		company: value.company,
		email: parsedEmail,
		type: USER_TYPES.CONTACT
	};
};
