/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const getItem = (itemId: string): Promise<string> => {
	const params = {
		id: itemId
	};
	const init: RequestInit = {
		method: 'get'
	};
	const url = `/service/home/~/?${new URLSearchParams(params).toString()}`;
	return fetch(url, init).then((response) => response.text());
};
