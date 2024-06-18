/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';

export type SendShareNotificationParams = {
	accountName: string;
	folderId: string;
	addresses: Array<string>;
	message?: string;
};

/*
 * TODO handle faults
 *
 * TODO JSON requests
 */
export const sendShareNotification = async ({
	accountName,
	folderId,
	addresses,
	message
}: SendShareNotificationParams): Promise<Array<void>> =>
	Promise.all(
		map(addresses, (address) =>
			fetch('/service/soap/SendShareNotificationRequest', {
				method: 'POST',
				headers: {
					'content-type': 'application/soap+xml'
				},
				body: `<?xml version="1.0" encoding="utf-8"?>
                <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
                    <soap:Header>
                        <context xmlns="urn:zimbra">
                            <account by="name">${accountName}</account>
                            <format type="js"/>
                        </context>
                    </soap:Header>
                    <soap:Body>
                    <SendShareNotificationRequest xmlns="urn:zimbraMail">
                           <item id="${folderId}"/>
                           <e a="${address}"/>
                           ${message ? `<notes>${message}</notes>` : ''}
                           
                    </SendShareNotificationRequest>				
                    </soap:Body>
                </soap:Envelope>
            `
			}).then((response) => response.json())
		)
	);
