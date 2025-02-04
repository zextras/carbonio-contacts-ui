import { generateFolder } from '../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { Folder } from '../../../carbonio-ui-commons/types';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export function generateLinkFolder(folderId: string, remoteId: string, permissions = 'r'): Folder {
	// TODO: generator in commons does not support setting rid
	const folder = generateFolder({
		isLink: true,
		id: folderId,
		perm: permissions
	});
	return {
		...folder,
		rid: remoteId
	} as Folder;
}
