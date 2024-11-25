/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipAction, ChipItem } from '@zextras/carbonio-design-system';

import type { Contact } from './contact';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import type { DistributionList } from '../../model/distribution-list';

export type ContactInputContact = Partial<Omit<Contact, 'email'>> & { email?: string };

export type ContactInputGroup = ContactInputItem &
	Required<Pick<ContactInputItem, 'display'>> & {
		isGroup: true;
		groupId: string;
		email?: '';
	};

export type ContactInputDistributionList = ChipItem<UserDistributionList>;

export type ContactChipAction = Omit<ChipAction, 'onClick'> & {
	isVisible: (chipItem: ContactInputItem | DistributionList) => boolean;
	onClick: (chipItem: ContactInputItem | DistributionList) => void;
};

type USER_TYPES = {
	GROUP: 'CONTACT_GROUP';
	DISTRIBUTION_LIST: 'DISTRIBUTION_LIST';
	CONTACT: 'CONTACT';
};

export const USER_TYPES: USER_TYPES = {
	GROUP: 'CONTACT_GROUP',
	DISTRIBUTION_LIST: 'DISTRIBUTION_LIST',
	CONTACT: 'CONTACT'
};

export type UserContactGroup = {
	id: string;
	display: string;
	groupId: string;
	type: USER_TYPES['GROUP'];
};

export type UserDistributionList = {
	id: string;
	email: string;
	type: USER_TYPES['DISTRIBUTION_LIST'];
};

export type UserContact = {
	id: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	fullName?: string;
	company?: string;
	email: string;
	type: USER_TYPES['CONTACT'];
};
export type ContactInputItemValue = UserContactGroup | UserDistributionList | UserContact;
export type ContactInputItem = ChipItem<ContactInputItemValue>;

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ContactInputValue = ContactInputItemValue[];

export type ContactInputOnChange = ((items: ContactInputValue) => void) | undefined;
export type ContactInputChipDisplayName =
	(typeof CHIP_DISPLAY_NAME_VALUES)[keyof typeof CHIP_DISPLAY_NAME_VALUES];
