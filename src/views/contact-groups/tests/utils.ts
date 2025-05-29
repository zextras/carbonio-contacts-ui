import { Folder } from '@zextras/carbonio-ui-commons';

import { generateFolder } from '@test-utils/folders/folders-generator';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export function generateLinkFolder({
	folderId,
	remoteAccountUuId,
	remoteId,
	permissions = 'r',
	absFolderPath,
	name
}: {
	folderId: string;
	remoteAccountUuId: string;
	remoteId: string;
	permissions?: string;
	absFolderPath?: string;
	name?: string;
}): Folder {
	// TODO: generator in commons does not support setting rid and zid
	const folder = generateFolder({
		isLink: true,
		id: folderId,
		perm: permissions,
		absFolderPath,
		name
	});
	return {
		...folder,
		rid: remoteId,
		zid: remoteAccountUuId
	} as Folder;
}
