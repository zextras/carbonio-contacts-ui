/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, map, reduce } from 'lodash';

import { buildContact } from './model-builder';
import { Contact } from '../legacy/types/contact';
import { State } from '../legacy/types/store';

export const generateState = ({
	contacts = [buildContact()]
}: {
	contacts: Array<Contact>;
}): Partial<State> => {
	const folders = Array.from(new Set(map(contacts, (contact) => contact.parent)).values());
	const state: Partial<State> = {
		contacts: {
			status: reduce(folders, (result, folder) => ({ ...result, [folder]: true }), {}),
			contacts: reduce(
				folders,
				(result, folder) => ({
					...result,
					[folder]: filter(contacts, (contact) => contact.parent === folder)
				}),
				{}
			)
		}
	};

	return state;
};
