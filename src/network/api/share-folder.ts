/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';

export type ShareFolderParams = {
	addresses: Array<string>;
	role: string;
	folderId: string;
	accountName: string;
};

export const shareFolder = async ({
	addresses,
	folderId,
	role,
	accountName
}: ShareFolderParams): Promise<void> => {
	const requestsBody = `<BatchRequest xmlns="urn:zimbra" onerror="stop">
        ${map(
					addresses,
					(
						address,
						key
					) => `<FolderActionRequest xmlns="urn:zimbraMail" requestId="${key}"><action op="grant" id="${folderId}">
        <grant gt="usr" inh="1" d="${address}" perm="${role}" pw=""/></action></FolderActionRequest>`
				).join('')}    
        </BatchRequest>`;

	const res = await fetch('/service/soap/BatchRequest', {
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
					${requestsBody}				
				</soap:Body>
			</soap:Envelope>
		`
	});
	const response = await res.json();
	if (response.Body.BatchResponse.Fault) {
		throw new Error(response.Body.BatchResponse.Fault[0].Reason.Text);
	}
};
