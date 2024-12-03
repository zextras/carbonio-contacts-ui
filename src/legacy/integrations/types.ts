/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipItem, type ChipInputProps, type DropdownItem } from '@zextras/carbonio-design-system';

export type ContactInputGroup = ContactInputItem &
	Required<Pick<ContactInputItem, 'display'>> & {
		isGroup: true;
		groupId: string;
		email?: '';
	};

export type ContactInputUser = RequiredEmailLabelChipItem<UserContact>;

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
export const EDIT_ACTION_ID = 'edit-contact-chip-action';
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

export type ContactInputOnChange = ((items: ContactInputItem[]) => void) | undefined;

export type ContactGroup = {
	company?: string;
	name: string;
	groupId: string;
};

export type UserOrDL = UserContact | UserDistributionList;

export type ContactInputItem = RequiredEmailLabelChipItem<UserOrDL>;

export type ContactInputValue = ContactInputItem[];
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
	defaultValue: Array<ContactInputItem>;
	dragAndDropEnabled?: boolean;
	orderedAccountIds?: Array<string>;
};

type RequiredEmailLabelChipItem<T> = Required<Pick<ChipItem<T>, 'value'>> &
	Required<Pick<ChipItem<T>, 'label'>> &
	Omit<ChipItem<T>, 'label' | 'value'>;

type OnExpandDL = (expandedDL: UserDistributionList, items: Array<ContactInputItem>) => void;
export type ContactInputDistributionList = RequiredEmailLabelChipItem<UserDistributionList> & {
	onExpandDL: OnExpandDL;
};

export type RemoteUserContact = {
	isGroup: boolean;
	email: string;
	first?: string;
	last?: string;
	middle?: string;
	full?: string;
	company?: string;
};

export type RemoteContactGroup = {
	isGroup: boolean;
	exp: boolean;
	id: string;
	l: string;
	display: string;
};

export type RemoteDistributionList = {
	isGroup: boolean;
	email: string;
	exp: boolean;
	full: string;
	fileas: string;
};

export type RemoteContactResponse = RemoteUserContact | RemoteContactGroup | RemoteDistributionList;

export type ContactInputOptions = DropdownItem & { value?: ContactInputItemInternal };
