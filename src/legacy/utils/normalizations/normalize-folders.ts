/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isTrash } from '@zextras/carbonio-ui-commons';
import { reduce } from 'lodash';

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
