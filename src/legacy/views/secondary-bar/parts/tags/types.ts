/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';

export type ItemType = {
	CustomComponent: ComponentType<any>;
	item: AccordionItemType;
	active: boolean;
	color: number;
	divider: boolean;
	id: string;
	label: string;
	name: string;
	open: boolean;
	actions?: Array<unknown>;
};

export type TagsAccordionItems = {
	items: ItemType[];
	id: string;
	label: string;
	divider?: true;
	active: false;
	open: boolean;
	onClick: AccordionItemType['onClick'];
	CustomComponent: ComponentType<any>;
};
