/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-ui-commons';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { map } from 'lodash';

import { GenericSoapPayload } from 'network/api/types';

export type SendShareNotificationParams = {
	accountName: string;
	folderId: string;
	addresses: Array<string>;
	message?: string;
};

export interface SendShareNotificationRequest extends GenericSoapPayload<typeof JSNS.MAIL> {
	item: { id: string };
	e: Array<{ a: string }>;
	notes?: string;
}

export type SendShareNotificationResponse = GenericSoapPayload<typeof JSNS.MAIL>;

export const sendShareNotification = ({
	folderId,
	addresses,
	message
}: SendShareNotificationParams): Promise<Array<void>> =>
	Promise.all(
		map(addresses, (address) =>
			legacySoapFetch<SendShareNotificationRequest, SendShareNotificationResponse>(
				'SendShareNotification',
				{
					item: { id: folderId },
					e: [{ a: address }],
					...(message ? { notes: message } : {}),
					_jsns: JSNS.MAIL
				}
			).then(() => undefined)
		)
	);
