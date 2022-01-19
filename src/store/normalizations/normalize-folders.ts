/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { reduce } from 'lodash';
import { ContactsFolder } from '../../types/contact';
import { ISoapFolderObj } from '../../types/soap';
import { FoldersSlice } from '../../types/store';

function extractFolders(accordions: ISoapFolderObj[]): ISoapFolderObj[] {
	return reduce(
		accordions,
		(acc, v) => {
			if (v && v.folder && v.folder.length) {
				return [...acc, v, ...extractFolders(v.folder)];
			}
			return [...acc, v];
		},
		[] as ISoapFolderObj[]
	);
}

export function normalizeFolders(
	state: FoldersSlice,
	soapFolderObj: ISoapFolderObj[]
): ContactsFolder[] {
	const extractedFolders = extractFolders(soapFolderObj);
	return reduce(
		extractedFolders,
		(acc, v) => {
			if (v.view === 'contact' || v.id === FOLDERS.TRASH) {
				const normalizedFolder = {
					itemsCount: v.n || 0,
					id: v.id,
					path: v.absFolderPath,
					parent: v.l,
					label: v.name,
					absParent: v.absParent || undefined,
					deletable: v.deletable,
					view: v.view,
					cn: v.cn || [],
					all: { ...v },
					color: v.color ? v.color : 0,
					isShared: !!v.owner,
					sharedWith: v.acl
				} as ContactsFolder;

				return [...acc, normalizedFolder] as ContactsFolder[];
			}
			return acc;
		},
		[] as ContactsFolder[]
	);
}
