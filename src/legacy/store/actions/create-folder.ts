/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { ContactsFolder } from '../../types/contact';

export const createFolder = createAsyncThunk(
	'folder/createFolder',
	async ({ parentFolder, name }: { parentFolder: ContactsFolder; name: string; id: string }) => {
		const { folder } = (await soapFetch('CreateFolder', {
			_jsns: 'urn:zimbraMail',
			folder: {
				view: 'contact',
				l: parentFolder.id || '7',
				name
			}
		})) as { folder: ContactsFolder };
		return folder;
	}
);
