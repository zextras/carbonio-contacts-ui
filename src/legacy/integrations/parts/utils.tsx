/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { trim, unescape } from 'lodash';

import { parseEmail } from '../../../carbonio-ui-commons/helpers/email-parser';
import type {
	ContactInputDistributionList,
	ContactInputGroup,
	ContactInputItem
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

// TODO: check if the empty string can be removed easily without changing all the typization
export const getContactId = (contact: ContactInputItem): string =>
	contact.id ?? contact.email ?? '';

export const getChipLabel = (
	contact: Pick<
		ContactInputItem,
		'firstName' | 'middleName' | 'lastName' | 'email' | 'address' | 'display' | 'fullName' | 'name'
	>
): string => {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}

	const email = typeof contact.email === 'string' ? contact.email : undefined;
	const address = typeof contact.address === 'string' ? contact.address : undefined;

	return contact.fullName ?? email ?? contact.name ?? address ?? contact.display ?? '';
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

// TODO: Remember to align with the getChipLabel about the label value
export const mapToContactInputItem = (value: RemoteContactResponse): ContactInputItem => {
	if (newIsContactGroup(value)) {
		return {
			id: value.id,
			display: value.display,
			isGroup: value.isGroup,
			groupId: value.id,
			label: value.display
		};
	}
	const parsedEmail = tryToParseEmail(value.email);
	if (newIsDistributionList(value)) {
		return {
			id: parsedEmail,
			display: parsedEmail,
			isGroup: value.isGroup,
			label: parsedEmail,
			email: parsedEmail
		};
	}
	return {
		id: parsedEmail,
		display: parsedEmail,
		isGroup: value.isGroup,
		label: parsedEmail,
		firstName: value.first,
		lastName: value.last,
		fullName: value.full,
		company: value.company,
		email: parsedEmail
	};
};
