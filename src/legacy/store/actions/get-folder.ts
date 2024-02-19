/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const getFolder = createAsyncThunk(
	'folders/search_folder',
	async (folderId: string): Promise<any> =>
		soapFetch('GetFolder', {
			_jsns: 'urn:zimbraMail',
			folder: folderId ?? {},
			tr: true
		})
);
