/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import { ContactsFolder } from '../../types/contact';

export const folderAction = createAsyncThunk(
	'contacts/folderAction',
	async ({
		folder,
		op,
		name,
		l,
		recursive,
		color,
		zid
	}: {
		folder: ContactsFolder;
		op: string;
		name?: string;
		l?: string;
		recursive?: boolean;
		color?: number;
		zid?: string;
	}) => {
		const result = await soapFetch('FolderAction', {
			action: omitBy(
				{
					id: folder.id,
					op,
					l,
					recursive,
					name,
					color,
					zid
				},
				isNil
			),
			_jsns: 'urn:zimbraMail'
		});
		return result;
	}
);
