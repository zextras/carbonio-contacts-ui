/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch } from '@zextras/carbonio-shell-ui';

import {
	ImportAddressBookRequest,
	ImportAddressBookResponse
} from '../../types/import-address-book';

export const importAddressBook = async ({
	folderId,
	aid
}: ImportAddressBookRequest): Promise<ImportAddressBookResponse> =>
	soapFetch('ImportContacts', {
		_jsns: 'urn:zimbraMail',
		ct: 'csv',
		csvfmt: 'thunderbird-csv',
		l: folderId,
		content: { aid }
	});
