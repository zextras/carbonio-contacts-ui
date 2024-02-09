/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { map, reduce } from 'lodash';

import { buildContact } from './model-builder';
import { FOLDERS_DESCRIPTORS } from '../constants/tests';
import { Contact } from '../legacy/types/contact';
import { State } from '../legacy/types/store';

export const generateState = ({
	folders = [
		{
			descriptor: FOLDERS_DESCRIPTORS.contacts,
			contacts: [buildContact()]
		}
	]
}: {
	folders?: Array<{
		descriptor: (typeof FOLDERS_DESCRIPTORS)[keyof typeof FOLDERS_DESCRIPTORS];
		contacts: Array<Contact>;
	}>;
}): Partial<State> => {
	const state: Partial<State> = {
		folders: {
			status: 'complete',
			folders: map(folders, (folder) => ({
				items: [],
				id: folder.descriptor.id,
				itemsCount: faker.number.int(),
				path: faker.string.alpha(),
				parent: '1',
				label: folder.descriptor.desc,
				deletable: faker.datatype.boolean(),
				view: faker.string.alpha(),
				color: 1,
				isShared: false,
				sharedWith: faker.string.uuid(),
				perm: faker.string.uuid()
			}))
		},
		contacts: {
			status: reduce(
				folders,
				(result, folder) => ({ ...result, [folder.descriptor.id]: true }),
				{}
			),
			contacts: reduce(
				folders,
				(result, folder) => ({
					...result,
					[folder.descriptor.id]: map<Contact, Contact>(folder.contacts, (contact) => ({
						...contact,
						parent: folder.descriptor.id
					}))
				}),
				{}
			)
		}
	};

	return state;
};
