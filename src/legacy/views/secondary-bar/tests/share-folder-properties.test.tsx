/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { screen } from '@testing-library/react';

import { createAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../../tests/generators/store';
import { ContactsFolder } from '../../../types/contact';
import { GetFolderActionRequest, GetFolderActionResponse } from '../../../types/soap';
import { ShareFolderProperties } from '../parts/edit/share-folder-properties';

describe('share-folder-properties', () => {
	test('getFolderRequest will call and grantee will set as per response', async () => {
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

		const email1 = faker.internet.email();
		const email2 = faker.internet.email();
		const response: GetFolderActionResponse = {
			folder: [
				{
					id: '3022',
					uuid: faker.string.uuid(),
					deletable: true,
					name: 'Test contacts',
					absFolderPath: '/Test contacts',
					l: '1',
					luuid: '3990af7f-6493-4d45-bbdf-ab3d144163e1',
					color: 5,
					view: 'contact',
					rev: 41305,
					ms: 127744,
					webOfflineSyncDays: 0,
					activesyncdisabled: false,
					n: 11,
					s: 0,
					i4ms: 86802,
					i4next: 35851,
					perm: 'r',
					cn: [],
					acl: {
						grant: [
							{
								zid: faker.string.uuid(),
								gt: 'usr',
								perm: 'r',
								d: email1
							},
							{
								zid: faker.string.uuid(),
								gt: 'usr',
								perm: 'rwidx',
								d: email2
							}
						]
					}
				}
			]
		};

		createAPIInterceptor<GetFolderActionRequest, GetFolderActionResponse>(
			'GetFolder',
			undefined,
			response
		);

		setupTest(<ShareFolderProperties folder={currentFolder} setActiveModal={setActiveModal} />, {
			store
		});
		expect(await screen.findByText(`${email1} - Viewer`, { exact: false }));
		expect(await screen.findByText(`${email2} - Manager`, { exact: false }));
	});
});
