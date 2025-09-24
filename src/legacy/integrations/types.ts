/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipItem, type DropdownItem } from '@zextras/carbonio-design-system';
import {
	ContactInputItem,
	DistributionListContact,
	ContactInputItemInternalValue
} from '@zextras/carbonio-ui-commons';

export type ContactInputGroup = ContactInputItem &
	Required<Pick<ContactInputItem, 'display'>> & {
		isGroup: true;
		groupId: string;
		email?: '';
	};

export type ContactGroup = {
	company?: string;
	name: string;
	groupId: string;
};

type RequiredEmailLabelChipItem<T> = Required<Pick<ChipItem<T>, 'value'>> &
	Required<Pick<ChipItem<T>, 'label'>> &
	Omit<ChipItem<T>, 'label' | 'value'>;

type OnExpandDL = (expandedDL: DistributionListContact, memberEmails: Array<string>) => void;
export type ContactInputDistributionList = RequiredEmailLabelChipItem<DistributionListContact> & {
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
	display?: string;
};

export type RemoteGroupContact = {
	isGroup: boolean;
	exp: boolean;
	id: string;
	l: string;
	display: string;
};

export type RemoteDistributionListContact = {
	isGroup: boolean;
	email: string;
	exp: boolean;
	full: string;
	fileas: string;
};

export type RemoteContactResponse =
	| RemoteUserContact
	| RemoteGroupContact
	| RemoteDistributionListContact;

export type ContactInputItemInternal = ChipItem<ContactInputItemInternalValue>;
export type ContactInputOptions = DropdownItem & { value?: ContactInputItemInternal };
