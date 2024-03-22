/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil, map, omitBy, reduce } from 'lodash';

import { isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactsFolder } from '../../types/contact';
import { ISoapFolderObj } from '../../types/soap';

export const extractFolders = (accordions: ISoapFolderObj[]): ISoapFolderObj[] =>
	reduce(
		accordions,
		(acc, v) => {
			if ((v && v.view === 'contact') || isTrash(v.id)) {
				if (v.folder && v.folder.length) {
					return [...acc, v, ...extractFolders(v.folder)];
				}
				return [...acc, v];
			}
			return acc;
		},
		[] as ISoapFolderObj[]
	);

export const normalizeFolders = (soapFolderObj: ISoapFolderObj[]): Array<ContactsFolder> =>
	map(soapFolderObj, (v) =>
		omitBy(
			{
				itemsCount: v.n,
				id: v.id,
				path: v.absFolderPath,
				parent: v.l,
				label: v.name,
				deletable: v.deletable,
				owner: v.owner,
				view: v.view,
				color: v.color,
				isShared: v.owner ? !!v.owner : undefined,
				perm: v.perm,
				sharedWith: v.acl,
				broken: v.broken ? v.broken : false,
				zid : v.zid,
				rid : v.rid
			},
			isNil
		)
	) as Array<ContactsFolder>;
