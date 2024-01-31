/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { rest } from 'msw';

import { getSetupServer } from '../../../../carbonio-ui-commons/test/jest-setup';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../../tests/generators/store';
import { ContactsFolder } from '../../../types/contact';
import { GetFolderActionRequest } from '../../../types/soap';
import { ShareFolderProperties } from '../parts/edit/share-folder-properties';

describe('share-folder-properties', () => {
	test('getFolderRequest will call with correct parameters', async () => {
		const setActiveModal = jest.fn();
		const store = generateStore();
		const currentFolder: ContactsFolder = {
			itemsCount: 5,
			id: '3022',
			path: '/Test contacts',
			parent: '1',
			label: 'Test contacts',
			deletable: true,
			view: 'contact',
			color: 2,
			sharedWith: {},
			perm: '',
			items: [],
			isShared: false,
			to: '/folder/3022'
		};

		setupTest(<ShareFolderProperties folder={currentFolder} setActiveModal={setActiveModal} />, {
			store
		});

		const folderActionInterceptor = new Promise<GetFolderActionRequest>((resolve, reject) => {
			// Register a handler for the REST call
			getSetupServer().use(
				rest.post('/service/soap/GetFolderRequest', async (req, res, ctx) => {
					if (!req) {
						reject(new Error('Empty request'));
					}
					const action = (await req.json()).Body.GetFolderRequest;
					resolve(action);

					return res(ctx.json({}));
				})
			);
		});
		const req = await folderActionInterceptor;
		expect(req.folder.l).toBe('3022');
	});
});
