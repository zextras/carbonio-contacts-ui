/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { soapFetch } from '@zextras/carbonio-shell-ui';
import { map, trim, unescape } from 'lodash';

import { parseEmail } from '../../../carbonio-ui-commons/helpers/email-parser';
import {
	ContactInputDistributionList,
	ContactInputGroup,
	ContactInputItem,
	ContactInputItemValue,
	USER_TYPES,
	UserContact,
	UserContactGroup
} from '../../types/integrations';
import {
	ContactInputOptions,
	NewContactGroup,
	NewDistributionList,
	RemoteContactResponse
} from '../types';
import { Hint } from './hint';
import { HintGroup } from './hint-group';
import type { FullAutocompleteRequest, SearchContactsResponse } from '../../types/contact';

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

function getUserChipLabel(contact: UserContact): string {
	if (contact.firstName ?? contact.middleName ?? contact.lastName) {
		return trim(`${contact.firstName ?? ''} ${contact.middleName ?? ''} ${contact.lastName ?? ''}`);
	}

	return contact.fullName ?? contact.email;
}

// TODO: check if it can be removed after fixing types
export const getChipLabel = (contact: ContactInputItemValue): string => {
	switch (contact.type) {
		case USER_TYPES.GROUP:
			return contact.display;
		case USER_TYPES.DISTRIBUTION_LIST:
			return contact.email;
		default:
			break;
	}
	return getUserChipLabel(contact);
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

export const mapToChipContactOptions = (value: RemoteContactResponse): ContactInputOptions => {
	if (newIsContactGroup(value)) {
		const contactGroup: UserContactGroup = {
			id: value.id,
			display: value.display,
			groupId: value.id,
			type: USER_TYPES.GROUP
		};
		return {
			label: contactGroup.display,
			value: contactGroup,
			id: getContactId(contactGroup),
			customComponent: <HintGroup contact={contactGroup} />
		};
	}
	const parsedEmail = tryToParseEmail(value.email);
	if (newIsDistributionList(value)) {
		const distributionList = {
			id: parsedEmail,
			email: parsedEmail,
			type: USER_TYPES.DISTRIBUTION_LIST
		};
		const label = distributionList.email;
		return {
			label,
			value: distributionList,
			id: getContactId(distributionList),
			customComponent: <Hint email={distributionList.email} label={label} />
		};
	}
	const contact = {
		id: parsedEmail,
		firstName: value.first,
		lastName: value.last,
		middleName: value.middle,
		fullName: value.full,
		company: value.company,
		email: parsedEmail,
		type: USER_TYPES.CONTACT
	};
	const label = getUserChipLabel(contact);
	return {
		label,
		value: contact,
		id: getContactId(contact),
		customComponent: <Hint email={contact.email} label={label} />
	};
};

export const searchContacts = (
	textToSearch: string,
	orderedAccountIds: Array<string>
): Promise<Array<ContactInputOptions>> =>
	soapFetch<FullAutocompleteRequest, SearchContactsResponse>('FullAutocomplete', {
		...(orderedAccountIds?.length > 0 && {
			orderedAccountIds: orderedAccountIds.toString()
		}),
		AutoCompleteRequest: {
			name: textToSearch,
			includeGal: 1
		},
		_jsns: 'urn:zimbraMail'
	}).then((autoCompleteResult) => map(autoCompleteResult.match, mapToChipContactOptions));
