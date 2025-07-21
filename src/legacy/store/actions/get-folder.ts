/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

export const getFolder = createAsyncThunk(
	'folders/search_folder',
	async (folderId: string): Promise<any> =>
		legacySoapFetch('GetFolder', {
			_jsns: 'urn:zimbraMail',
			folder: folderId ?? {},
			tr: true
		})
);
