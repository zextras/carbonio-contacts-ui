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

export type ContactInputDistributionList = ContactInputItem & { isGroup: true; email: string };

export type ContactChipAction = Omit<ChipAction, 'onClick'> & {
	isVisible: (chipItem: ContactInputItem | DistributionList) => boolean;
	onClick: (chipItem: ContactInputItem | DistributionList) => void;
};

export type ContactInputItem = ChipItem &
	ContactInputContact & {
		address?: string | Contact['address'];
		fullName?: string;
		name?: string;
		display?: string;
		isGroup?: boolean;
		groupId?: string;
	};

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ContactInputValue = ContactInputItem[];

export type ContactInputOnChange = ((items: ContactInputValue) => void) | undefined;
export type ContactInputChipDisplayName =
	(typeof CHIP_DISPLAY_NAME_VALUES)[keyof typeof CHIP_DISPLAY_NAME_VALUES];
