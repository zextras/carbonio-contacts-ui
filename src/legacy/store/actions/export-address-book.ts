/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

import { ExportContactsRequest, ExportContactsResponse } from '../../types/contact';

export const exportContacts = async ({
	folderId
}: ExportContactsRequest): Promise<ExportContactsResponse> =>
	soapFetch('ExportContacts', {
		_jsns: 'urn:zimbraMail',
		ct: 'csv',
		csvfmt: 'thunderbird-csv',
		l: folderId
	});
