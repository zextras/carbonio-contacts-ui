/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { GenericSoapPayload } from './types';

export interface ImportContactsRequest extends GenericSoapPayload<typeof JSNS.MAIL> {
	ct: 'csv';
	csvfmt: 'thunderbird-csv';
	l: string;
	content: { aid: string };
}

export type ImportContactsResponse = GenericSoapPayload<typeof JSNS.MAIL> & {
	cn: Array<{ n?: number; ids: string }>;
};

export type ImportContactsParams = {
	folderId: string;
	aid: string;
};

export type ImportContactsResult = {
	contactsCount?: number;
	contactsIds: Array<string>;
};

const normalizeResponse = (response: ImportContactsResponse): ImportContactsResult => ({
	contactsCount: response.cn?.[0]?.n ?? 0,
	contactsIds: response.cn?.[0]?.ids ? response.cn?.[0].ids.split(',') : []
});

export const importContacts = async ({
	folderId,
	aid
}: ImportContactsParams): Promise<ImportContactsResult> =>
	soapFetch<ImportContactsRequest, ImportContactsResponse | ErrorSoapBodyResponse>(
		'ImportContacts',
		{
			_jsns: JSNS.MAIL,
			ct: 'csv',
			csvfmt: 'thunderbird-csv',
			l: folderId,
			content: { aid }
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}

		return normalizeResponse(response);
	});
