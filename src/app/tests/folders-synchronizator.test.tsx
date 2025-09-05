/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { FOLDER_VIEW } from '@zextras/carbonio-ui-commons';
import * as commonsHook from '@zextras/carbonio-ui-commons';
import { HttpResponse } from 'msw';

import { FoldersSynchronizator } from '../folders-syncronization';
import { setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';

// mocking the worker. in commons jest-setup the worker is already mocked, but is improperly defined with wrong types and
// is causing a call to "onMessage", which tries to alter the folders store and overrides the folders, breaking the test.
// It also causes warning/errors due the fact it tries to set an "undefined" in the folders.
// I think we should consider removing that mock or redefine it or make it configurable
jest.mock('@zextras/carbonio-ui-commons', () => ({
	...jest.requireActual('@zextras/carbonio-ui-commons'),
	folderWorker: {
		postMessage: jest.fn()
	},
	tagsWorker: {
		postMessage: jest.fn()
	},
	useInitializeFolders: jest.fn()
}));

describe('FoldersSynchronizator', () => {
	beforeEach(() => {
		createAPIInterceptor('get', 'zx/login/v3/account', HttpResponse.json({}));
		createSoapAPIInterceptor('GetFolder', {
			folder: [generateFolder({ name: 'Inbox' })]
		});
		createSoapAPIInterceptor('GetShareInfo', { result: { share: [] } });
	});
	it('should call the useInitializeFolders hook with the contact folder view', () => {
		const useInitializeFoldersSpy = jest.spyOn(commonsHook, 'useInitializeFolders');

		setupTest(<FoldersSynchronizator />);

		expect(useInitializeFoldersSpy).toHaveBeenCalledWith(FOLDER_VIEW.contact);
	});
});
