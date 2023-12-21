/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { ChipItem } from '@zextras/carbonio-design-system';

import { Contact } from './contact';
import { CHIP_DISPLAY_NAME_VALUES } from '../../constants/contact-input';
import { ContactInputChipAction } from '../integrations/contact-input';

export type ContactInputValue = Array<
	ChipItem<string | Contact | ((prevState: ChipItem<string | Contact>[]) => ChipItem[])>
>;

export type ContactInputOnChange = ((items: ContactInputValue) => void) | undefined;
export type ContactInputChipDisplayName =
	(typeof CHIP_DISPLAY_NAME_VALUES)[keyof typeof CHIP_DISPLAY_NAME_VALUES];

export type CustomChipProps = React.PropsWithChildren<{
	id: string;
	label: string;
	email: string;
	isGroup: boolean;
	chipDisplayName?: ContactInputChipDisplayName;
	_onChange: ContactInputOnChange;
	contactInputValue: ContactInputValue;
	actions?: Array<ContactInputChipAction>;
}>;