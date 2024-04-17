/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NameSpace } from '@zextras/carbonio-shell-ui';

import { Grant } from '../../carbonio-ui-commons/types/folder';

export enum ContactPhoneType {
	MOBILE = 'mobile',
	WORK = 'work',
	HOME = 'home',
	OTHER = 'other'
}

export enum ContactAddressType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

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
	displayName?: string;
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
	middle?: string;
	last?: string;
	nick?: string;
	fileas?: string;
	ranking?: string;
	type?: string;
	isGroup?: boolean;
	email?: string;
	full?: string;
	company?: string;
	display?: string;
	id?: string;
	l?: string;
	exp?: string;
};

export type FullAutocompleteResponse = {
	canBeCached: string | null;
	match?: Match[];
	_jsns?: string;
};

export type ShareFolderRoleOptions = {
	label: string;
	value: string;
};

export type GranteeInfoProps = {
	grant: Grant;
	shareFolderRoleOptions: ShareFolderRoleOptions;
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
	shareFolderRoleOptions: ShareFolderRoleOptions;
};

export type ShareFolderPropertiesProps = {
	folder: ContactsFolder;
	setActiveModal: (modal: string) => void;
};

export type FullAutocompleteRequest = {
	orderedAccountIds?: Array<{ _content: string }>;
	AutoCompleteRequest: {
		name: string;
		includeGal: 0 | 1;
	};
	_jsns: NameSpace;
};

export type ExportContactsRequest = {
	folderId: string;
};

export type ExportContactsResponse = {
	content: [
		{
			_content: string;
		}
	];
};
