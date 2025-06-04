/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { soapFetch } from '@zextras/carbonio-shell-ui';
import { parseEmail, CONTACT_TYPES } from '@zextras/carbonio-ui-commons';
import { map, trim, unescape } from 'lodash';

import {
	GroupContact,
	ContactInputOptions,
	RemoteGroupContact,
	RemoteDistributionListContact,
	RemoteContactResponse,
	ContactInputGroup,
	ContactInputItemInternalValue
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

export const getContactId = (contact: ContactInputItemInternalValue): string =>
	contact.type === CONTACT_TYPES.GROUP ? contact.id : contact.email;

export const getContactLabel = (contact: ContactInputItemInternalValue): string => {
	switch (contact.type) {
		case CONTACT_TYPES.GROUP:
			return contact.display;
		case CONTACT_TYPES.DISTRIBUTION_LIST:
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

export function newIsContactGroup(value: RemoteContactResponse): value is RemoteGroupContact {
	return 'isGroup' in value && !('email' in value) && value.isGroup;
}

export function newIsDistributionList(
	value: RemoteContactResponse
): value is RemoteDistributionListContact {
	return 'isGroup' in value && 'email' in value && value.isGroup;
}

export const mapToChipContactOptions = (value: RemoteContactResponse): ContactInputOptions => {
	if (newIsContactGroup(value)) {
		const contactGroup: GroupContact = {
			id: value.id,
			display: value.display,
			groupId: value.id,
			type: CONTACT_TYPES.GROUP
		};
		return {
			label: getContactLabel(contactGroup),
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
			type: CONTACT_TYPES.DISTRIBUTION_LIST
		};
		const label = getContactLabel(distributionList);
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
		type: CONTACT_TYPES.CONTACT
	};
	const label = getContactLabel(contact);
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
