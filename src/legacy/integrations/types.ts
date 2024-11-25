/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { type ChipInputProps, type DropdownItem } from '@zextras/carbonio-design-system';

import type {
	ContactChipAction,
	ContactInputChipDisplayName,
	ContactInputItem,
	ContactInputOnChange,
	ContactInputValue
} from '../types/integrations';

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
	contactInputValue: ContactInputValue;
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
