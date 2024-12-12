/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { useInitializeFolders } from '../../carbonio-ui-commons/hooks/use-initialize-folders';

describe('FoldersSynchronizator', () => {
	it('should call the useInitializeFolders hook with the contact folder view', () => {
		setupTest(<FoldersSynchronizator />);
		expect(useInitializeFolders).toHaveBeenCalledWith(FOLDER_VIEW.contact);
	});
});
