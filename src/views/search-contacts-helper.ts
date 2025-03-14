/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';

export const searchContactsHelper = ({
	query,
	offset,
	sortBy
}: {
	query: { _content: string };
	offset: number;
	sortBy: string;
}) =>
	soapFetch<any, any>('Search', {
		limit: 100,
		query,
		offset,
		sortBy,
		types: 'contact',
		_jsns: 'urn:zimbraMail'
	}).then(({ cn, more, offset }) => ({
		query,
		more,
		cn,
		offset: (offset ?? 0) + 100,
		sortBy: sortBy ?? 'nameAsc'
	}));
