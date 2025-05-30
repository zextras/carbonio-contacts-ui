/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { JSNS } from '@zextras/carbonio-ui-commons';

import { GenericSoapPayload } from './types';

export interface ExportContactsRequest extends GenericSoapPayload<typeof JSNS.MAIL> {
	ct: 'csv';
	csvfmt: string;
	l: string;
}

export type ExportContactsResponse = GenericSoapPayload<typeof JSNS.MAIL> & {
	content: Array<{
		_content: string;
	}>;
};

const normalizeResponse = (response: ExportContactsResponse): string =>
	response.content?.[0]._content;

export const exportContacts = (folderId: string): Promise<string> => {
	const body = {
		_jsns: JSNS.MAIL,
		ct: 'csv',
		csvfmt: 'thunderbird-csv',
		l: folderId
	} satisfies ExportContactsRequest;
	return soapFetch<ExportContactsRequest, ExportContactsResponse | ErrorSoapBodyResponse>(
		'ExportContacts',
		body
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}

		return normalizeResponse(response);
	});
};
