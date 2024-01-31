/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Grant } from '@zextras/carbonio-shell-ui';

// eslint-disable-next-line no-shadow
export enum ContactPhoneType {
	MOBILE = 'mobile',
	WORK = 'work',
	HOME = 'home',
	OTHER = 'other'
}

// eslint-disable-next-line no-shadow
export enum ContactAddressType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

// eslint-disable-next-line no-shadow
export enum ContactUrlType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

export type ContactAddress = {
	type: ContactAddressType;
	street?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
};

export type ContactEmail = {
	mail: string;
};

export type ContactPhone = {
	number: string;
	type: ContactPhoneType;
};

export type ContactUrl = {
	url: string;
	type: ContactUrlType;
};

export type ContactAddressMap = { [key: string]: ContactAddress };
export type ContactEmailMap = { [key: string]: ContactEmail };
export type ContactPhoneMap = { [key: string]: ContactPhone };
export type ContactUrlMap = { [key: string]: ContactUrl };

export type AccordionFolder = {
	id: string;
	label: string;
	level?: number;
	items: AccordionFolder[];
	view: string;
	itemsCount: number;
	parent: string;
	path: string;
	all: any;
	onClick: any;
};
export type ContactsFolder = {
	items: ContactsFolder[] | [];
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id: string;
	itemsCount: number;
	path: string;
	parent: string;
	level?: number;
	label: string;
	deletable: boolean;
	view: string;
	to?: string;
	color: number;
	isShared: boolean;
	sharedWith: any;
	owner?: string;
	perm: any;
};

export type Contact = {
	_id?: string;
	/* Zimbra ID */ id: string;
	tags?: string[];
	firstName: string;
	middleName: string;
	lastName: string;
	nickName: string;
	parent: string;
	address: ContactAddressMap;
	company: string;
	department: string;
	email: ContactEmailMap;
	image: string;
	jobTitle: string;
	notes: string;
	phone: ContactPhoneMap;
	nameSuffix: string;
	namePrefix: string;
	URL: ContactUrlMap;
	fileAsStr: string;
};

export type Group = {
	display: undefined | string;
	email: string | undefined;
	exp: boolean;
	id: string;
	isGroup: boolean;
	l: string;
	ranking: string;
	type: string;
	galType?: string;
};

export type Match = {
	first?: string;
	last?: string;
	fileas?: string;
	ranking?: string;
	type?: string;
	isGroup?: boolean;
	email?: string;
	full?: string;
};

export type FullAutocompleteResponse = {
	match?: Match[];
	_attributes: {
		canBeCached: string | null;
		xmlns: string | null;
	};
};

export type shareFolderRoleOptions = {
	label: string;
	value: string;
};

export type GranteeInfoProps = {
	grant: Grant;
	shareFolderRoleOptions: shareFolderRoleOptions;
	hovered?: boolean;
};

export type ActionProps = {
	folder: ContactsFolder;
	grant: Grant;
	setActiveModal: (arg: string) => void;
	onMouseLeave: () => void;
	onMouseEnter: () => void;
};

export type GranteeProps = {
	grant: Grant;
	folder: ContactsFolder;
	onMouseLeave?: () => void;
	onMouseEnter?: () => void;
	setActiveModal: (modal: string) => void;
	shareFolderRoleOptions: shareFolderRoleOptions;
};

export type ShareFolderPropertiesProps = {
	folder: ContactsFolder;
	setActiveModal: (modal: string) => void;
};
