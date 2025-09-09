/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { useFolderStore, folderWorker } from '@zextras/carbonio-ui-commons';
import { SoapNotify } from '@zextras/carbonio-ui-soap-lib';
import { http } from 'msw';

import { useSync } from '../../../../../__mocks__/@zextras/carbonio-ui-soap-lib';
import { useSyncDataHandler } from '../use-sync-data-handler';
import { getSetupServer } from '@jest-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { handleGetFolderRequest } from '@test-utils/network/msw/handle-get-folder';
import { handleGetShareInfoRequest } from '@test-utils/network/msw/handle-get-share-info';

function getWrapper() {
	// eslint-disable-next-line react/display-name
	return ({ children }: { children: ReactNode }): ReactElement => <>{children}</>;
}

function mockSoapSync(notify: Array<SoapNotify>): void {
	jest.mocked(useSync).mockReturnValue(notify);
}

function generateSoapAction(partial?: Partial<SoapNotify>): SoapNotify {
	return {
		deleted: [],
		seq: 0,
		...partial
	};
}

function mockSoapDelete(mailboxNumber: number, deletedIds: Array<string>): void {
	const soapNotify = generateSoapAction({
		deleted: deletedIds
	});
	mockSoapSync([soapNotify]);
}

describe('sync data handler', () => {
	const mailboxNumber = 1000;

	describe('folders', () => {
		test('it will invoke the folders worker when a folders related notify is received', async () => {
			const folder = generateFolder({ id: '1' });
			useFolderStore.setState({ folders: { [folder.id]: folder } });
			const notify = { deleted: ['1'], seq: 0 };
			const workerSpy = jest.spyOn(folderWorker, 'postMessage');
			mockSoapDelete(mailboxNumber, ['1']);
			getSetupServer().use(http.post('/service/soap/GetFolderRequest', handleGetFolderRequest));
			getSetupServer().use(
				http.post('/service/soap/GetShareInfoRequest', handleGetShareInfoRequest)
			);

			renderHook(() => useSyncDataHandler(), {
				wrapper: getWrapper()
			});

			expect(workerSpy).toHaveBeenCalledTimes(1);
			expect(workerSpy).toHaveBeenCalledWith(
				expect.objectContaining({ op: 'notify', notify, state: expect.any(Object) })
			);
		});
	});
});
