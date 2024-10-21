/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// TODO move into Shell

import { NameSpace } from '../types/utils';

export const NAMESPACES = {
	account: 'urn:zimbraAccount',
	mail: 'urn:zimbraMail',
	generic: 'urn:zimbra'
} satisfies Record<string, NameSpace>;

export const SEARCH_CONTACTS_LIMIT = 100;
