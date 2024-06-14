/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';

import { CnItem } from './types';

export const createContactFromVcard = (messageId: string, part: string): Promise<CnItem> =>
	fetch(`/service/soap/CreateContactRequest`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			Body: {
				CreateContactRequest: {
					_jsns: 'urn:zimbraMail',
					cn: {
						l: FOLDERS.CONTACTS,
						vcard: {
							mid: messageId,
							part
						}
					}
				}
			},
			Header: {
				context: {
					_jsns: 'urn:zimbra'
				}
			}
		})
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Something went wrong');
		})
		.then(
			({ Body }: { Body: { CreateContactResponse: { cn: Array<CnItem> } } }) =>
				Body.CreateContactResponse.cn[0]
		);
