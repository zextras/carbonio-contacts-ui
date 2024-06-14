/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';

type GetItemRequest = {
	id: string;
};

type RegisterGetItemHandlerParam = {
	response?: string;
	error?: boolean;
};

export const registerGetItemHandler = ({
	response,
	error
}: RegisterGetItemHandlerParam = {}): Promise<GetItemRequest> => {
	const path = '/service/home/~/';
	return new Promise<GetItemRequest>((resolve, reject) => {
		getSetupServer().use(
			http.get<never, GetItemRequest>(path, async ({ request }) => {
				if (error) {
					return HttpResponse.error();
				}
				const queryParams = new URL(request.url).searchParams;
				const id = queryParams.get('id');
				if (!id) {
					reject(new Error('Item id is missing'));
					return Promise.reject(new Error('Item id is missing'));
				}

				const requestParams = {
					id
				};

				resolve(requestParams);

				return HttpResponse.text(response);
			})
		);
	});
};
