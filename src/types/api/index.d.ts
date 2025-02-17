/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SoapContact } from '../../legacy/types/soap';

export type SortBy =
	| 'dateDesc'
	| 'dateAsc'
	| 'idDesc'
	| 'idAsc'
	| 'subjDesc'
	| 'subjAsc'
	| 'nameDesc'
	| 'nameAsc'
	| 'durDesc'
	| 'durAsc'
	| 'none'
	| 'taskDueAsc'
	| 'taskDueDesc'
	| 'taskStatusAsc'
	| 'taskStatusDesc'
	| 'taskPercCompletedAsc'
	| 'taskPercCompletedDesc'
	| 'rcptAsc'
	| 'rcptDesc'
	| 'readAsc'
	| 'readDesc';

export type SearchContactsSoapResponse = {
	cn: Array<SoapContact>;
	more: boolean;
	offset: number;
	sortBy: SortBy;
};
export type SearchContactsSoapRequest = {
	_jsns: string;
	limit?: number;
	offset?: number;
	sortBy?: string;
	types: 'contact';
	query?: {
		_content: string;
	};
};
export type ContactsFilter = 'ALL' | 'CONTACT' | 'CONTACT_GROUP';
export type SearchContactsRequest = {
	folderId: string;
	offset?: number;
	type?: ContactsFilter;
};
export type SearchRequestAsyncThunkProps = {
	arg: SearchContactsRequest;
	requestId: string;
	requestStatus: string;
};
