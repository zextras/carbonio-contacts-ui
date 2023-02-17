/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { act } from '@testing-library/react';
import { rest } from 'msw';
import { generateStore } from '../../../tests/generators/store';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { folderAction } from '../../../store/actions/folder-action';
import { ContactsFolder } from '../../../types/contact';
import { FolderActionRequest } from '../../../types/soap';
/**
 * Test the address book Empty modal
 */
describe('Empty modal', () => {
	test('empty folder action with empty modal', async () => {
		const store = generateStore();
		const folderActionInterceptor = new Promise<FolderActionRequest>((resolve, reject) => {
			// Register a handler for the REST call
			getSetupServer().use(
				rest.post('/service/soap/FolderActionRequest', async (req, res, ctx) => {
					if (!req) {
						reject(new Error('Empty request'));
					}
					const action = (await req.json()).Body.FolderActionRequest;
					resolve(action);

					return res(ctx.json({}));
				})
			);
		});
		act(() => {
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
			store.dispatch<any>(folderAction({ folder: currentFolder, op: 'empty', recursive: true }));
		});
		const req = await folderActionInterceptor;
		expect(req.action.op).toBe('empty');
		expect(req.action.id).toBe('3022');
	});
});
