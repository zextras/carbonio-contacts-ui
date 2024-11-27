/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { ChipItem, type ChipInputProps, type DropdownItem } from '@zextras/carbonio-design-system';
import { ChipAction } from '@zextras/carbonio-design-system';

import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import type { DistributionList } from '../../model/distribution-list';
import { Contact } from '../types/contact';

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

export type ContactInputItemInternal = ChipItem<ContactInputItemValue>;

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ContactInputOnChange = ((items: ContactInputItem[]) => void) | undefined;
export type ContactInputChipDisplayName =
	(typeof CHIP_DISPLAY_NAME_VALUES)[keyof typeof CHIP_DISPLAY_NAME_VALUES];

export type RemoteContact = {
	id: string;
	email: string;
	first?: string;
	last?: string;
	company?: string;
	full?: string;
	display?: string;
};

export type ContactGroup = {
	company?: string;
	name: string;
	groupId: string;
};

type UserOrDL = UserContact | UserDistributionList;

export type ContactInputItem = { label: string; value: UserOrDL } & ChipItem<UserOrDL>;

export type ContactInputProps = Pick<
	ChipInputProps,
	| 'icon'
	| 'iconAction'
	| 'placeholder'
	| 'background'
	| 'iconDisabled'
	| 'description'
	| 'hasError'
	| 'inputRef'
> & {
	onChange?: ContactInputOnChange;
	value: Array<ContactInputItem>;
	dragAndDropEnabled?: boolean;
	orderedAccountIds?: Array<string>;
	chipDisplayName?: ContactInputChipDisplayName;
	contactActions?: Array<ContactChipAction>;
};

export type ContactInputCustomChipComponentProps = DLCustomChipProps & {
	chipDisplayName?: ContactInputChipDisplayName;
	contactActions?: Array<ContactChipAction>;
};

export type CustomChipProps = React.ComponentPropsWithoutRef<
	NonNullable<ChipInputProps['ChipComponent']>
> & {
	email?: string;
	isGroup?: boolean;
};

export type DLCustomChipProps = CustomChipProps & {
	contactInputOnChange: ContactInputOnChange;
	contactInputValue: ContactInputItem[];
};

export type NewContact = {
	isGroup: boolean;
	email: string;
	first?: string;
	last?: string;
	middle?: string;
	full?: string;
	company?: string;
};

export type NewContactGroup = {
	isGroup: boolean;
	exp: boolean;
	id: string;
	l: string;
	display: string;
};

export type NewDistributionList = {
	isGroup: boolean;
	email: string;
	exp: boolean;
	full: string;
	fileas: string;
};

export type RemoteContactResponse = NewContact | NewContactGroup | NewDistributionList;

export type ContactInputOptions = DropdownItem & { value?: ContactInputItem };
