/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

export const createMountpoint = createAsyncThunk(
	'folders/get folder',
	async (links: any): Promise<any> => {
		const res = await soapFetch('Batch', {
			CreateMountpointRequest: map(links, (link) => ({
				link: {
					l: 1,
					name: `${link.name} ${link.of} ${link.ownerName}`,
					rid: link.folderId,
					view: 'contact',
					zid: link.ownerId
				},
				_jsns: 'urn:zimbraMail'
			})),
			_jsns: 'urn:zimbra'
		});
		return res;
	}
);
