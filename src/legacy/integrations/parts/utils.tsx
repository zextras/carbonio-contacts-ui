/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	parseEmail,
	CONTACT_TYPES,
	ContactInputItemInternalValue,
	GroupContact,
	DistributionListContact
} from '@zextras/carbonio-ui-commons';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { map, unescape } from 'lodash';

import { Hint } from 'legacy/integrations/parts/hint';
import { HintGroup } from 'legacy/integrations/parts/hint-group';
import {
	ContactInputOptions,
	RemoteGroupContact,
	RemoteDistributionListContact,
	RemoteContactResponse,
	ContactInputGroup
} from 'legacy/integrations/types';
import type { FullAutocompleteRequest, SearchContactsResponse } from 'legacy/types/contact';

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

type DistributionListContactWithDisplay = DistributionListContact & { fullName?: string };

function isGroupContact(
	contact: ContactInputItemInternalValue | DistributionListContactWithDisplay
): contact is ContactInputItemInternalValue & { type: typeof CONTACT_TYPES.GROUP } {
	return contact.type === CONTACT_TYPES.GROUP;
}

function isDistributionListContact(
	contact: ContactInputItemInternalValue | DistributionListContactWithDisplay
): contact is DistributionListContactWithDisplay {
	return contact.type === CONTACT_TYPES.DISTRIBUTION_LIST;
}

function getGroupLabel(contact: { display: string }): string {
	return contact.display;
}

function getDistributionListLabel(contact: { fullName?: string; email: string }): string {
	return contact.fullName?.trim() ? contact.fullName : contact.email;
}

/**
 * Extracts display name from email format like "Display Name" <email@domain.com>
 * Returns the display name if found, otherwise returns undefined
 */
function extractDisplayNameFromEmail(email: string): string | undefined {
	const match = /^"([^"]+)"\s*<.+>$/.exec(email);
	return match ? match[1].trim() : undefined;
}

/**
 * Trims whitespace from a string value, returning an empty string if the value is undefined or null.
 */
function trimValue(val?: string): string {
	return val?.trim() ?? '';
}

/**
 * Generates a human-friendly label for a person contact with the following priority:
 * 1. Use `display` if provided and non-empty.
 * 2. Use `fullName` if provided and non-empty.
 * 3. Use a concatenation of `firstName` and `lastName` if available.
 * 4. If none of the above are usable, attempt to extract a display name from the email.
 * 5. Fallback: return the `email` address itself.
 */
function getPersonLabel(
	contact: {
		firstName?: string;
		lastName?: string;
		fullName?: string;
		email: string;
		display?: string;
	},
	originalContactEmail: string | undefined
): string {
	// 1. Display field
	const display = trimValue(contact.display);
	if (display) return display;

	// 2. Full Name field
	const fullName = trimValue(contact.fullName);
	if (fullName) return fullName;

	// 3. Constructed name parts
	const nameParts = [contact.firstName, contact.lastName].map(trimValue).filter(Boolean);
	if (nameParts.length > 0) return nameParts.join(' ');

	// 4. Extract from email (before falling back to raw email)
	const extracted = extractDisplayNameFromEmail(originalContactEmail ?? '');
	if (extracted) return extracted;

	// 5. Final fallback: email
	return contact.email;
}

export const getContactLabel = (
	contact: (ContactInputItemInternalValue | DistributionListContactWithDisplay) & {
		originalContactEmail?: string;
	}
): string => {
	if (isGroupContact(contact)) return getGroupLabel(contact);
	if (isDistributionListContact(contact)) return getDistributionListLabel(contact);
	return getPersonLabel(contact, contact.originalContactEmail);
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
		const distributionList: DistributionListContactWithDisplay = {
			id: parsedEmail,
			email: parsedEmail,
			type: CONTACT_TYPES.DISTRIBUTION_LIST,
			fullName: value.full
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
		fullName: value.full,
		company: value.company,
		email: parsedEmail,
		display: value.display,
		type: CONTACT_TYPES.CONTACT,
		originalContactEmail: value.email
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
	legacySoapFetch<FullAutocompleteRequest, SearchContactsResponse>('FullAutocomplete', {
		...(orderedAccountIds?.length > 0 && {
			orderedAccountIds: orderedAccountIds.toString()
		}),
		AutoCompleteRequest: {
			name: textToSearch,
			includeGal: 1
		},
		_jsns: 'urn:zimbraMail'
	}).then((autoCompleteResult) => map(autoCompleteResult.match, mapToChipContactOptions));
