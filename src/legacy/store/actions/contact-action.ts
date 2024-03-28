/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const contactAction = createAsyncThunk(
	'contacts/contactAction',
	async ({
		contactsIDs,
		destinationID,
		op,
		tagName
	}: {
		contactsIDs: Array<string>;
		destinationID?: string;
		op: string;
		tagName: string;
	}) => {
		const ids = contactsIDs.join(',');

		return soapFetch('ContactAction', {
			_jsns: 'urn:zimbraMail',
			action: omitBy(
				{
					id: ids,
					op,
					l: destinationID,
					tn: tagName
				},
				isNil
			)
		});
	}
);
