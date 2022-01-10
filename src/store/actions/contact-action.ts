/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';

export const contactAction = createAsyncThunk(
	'contacts/contactAction',
	async ({
		contactsIDs,
		destinationID,
		op
	}: {
		contactsIDs: any;
		destinationID: string;
		op: string;
	}) => {
		const ids = contactsIDs.join(',');
		const res = await soapFetch('ContactAction', {
			_jsns: 'urn:zimbraMail',
			action: {
				id: ids,
				op,
				l: destinationID
			}
		});
		return res;
	}
);
