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
