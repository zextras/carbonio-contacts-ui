/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { GenericSoapPayload } from './types';
import { NAMESPACES } from '../../constants/api';

export interface ExportContactsRequest extends GenericSoapPayload<typeof NAMESPACES.mail> {
	ct: 'csv';
	csvfmt: string;
	l: string;
}

export interface ExportContactsResponse extends GenericSoapPayload<typeof NAMESPACES.mail> {
	content: Array<{
		_content: string;
	}>;
}

const normalizeResponse = (response: ExportContactsResponse): string =>
	response.content?.[0]._content;

export const exportContacts = (folderId: string): Promise<string> => {
	const body = {
		_jsns: 'urn:zimbraMail',
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
