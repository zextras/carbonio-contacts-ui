/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { SoapNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { http } from 'msw';
import { Provider } from 'react-redux';

import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { getSetupServer } from '../../../../carbonio-ui-commons/test/jest-setup';
import { useNotify } from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { handleGetFolderRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handle-get-folder';
import { handleGetShareInfoRequest } from '../../../../carbonio-ui-commons/test/mocks/network/msw/handle-get-share-info';
import { folderWorker } from '../../../../carbonio-ui-commons/worker';
import { generateStore } from '../../../tests/generators/store';
import { useSyncDataHandler } from '../use-sync-data-handler';

function getWrapper() {
	// eslint-disable-next-line react/display-name
	return ({ children }: { children: ReactNode }): ReactElement => (
		<Provider store={generateStore()}>{children}</Provider>
	);
}

function mockSoapRefresh(mailbox: number): void {
	(useRefresh as jest.Mock).mockReturnValue({
		mbx: [{ s: mailbox }]
	});
}

function generateSoapAction(partial?: Partial<SoapNotify>): SoapNotify {
	return {
		deleted: [],
		seq: 0,
		...partial
	};
}

function mockSoapDelete(mailboxNumber: number, deletedIds: Array<string>): void {
	mockSoapRefresh(mailboxNumber);
	const soapNotify = generateSoapAction({
		deleted: deletedIds
	});
	(useNotify as jest.Mock).mockReturnValue([soapNotify]);
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

			useNotify.mockReturnValueOnce([notify]);
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
