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
	const relativeUrl = `/service/home/~/?${new URLSearchParams(params).toString()}`;
	const absoluteUrl = new URL(relativeUrl, 'http://localhost/').toString();
	const url = process.env.NODE_ENV === 'test' ? absoluteUrl : relativeUrl;
	return fetch(url, init).then((response) => response.text());
};
