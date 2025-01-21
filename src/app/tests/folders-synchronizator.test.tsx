/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import * as commonsHook from '../../carbonio-ui-commons/hooks/use-initialize-folders';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { FoldersSynchronizator } from '../folders-syncronization';

describe('FoldersSynchronizator', () => {
	it('should call the useInitializeFolders hook with the contact folder view', () => {
		const useInitializeFoldersSpy = jest.spyOn(commonsHook, 'useInitializeFolders');

		setupTest(<FoldersSynchronizator />);

		expect(useInitializeFoldersSpy).toHaveBeenCalledWith(FOLDER_VIEW.contact);
	});
});
