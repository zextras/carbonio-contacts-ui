/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DefaultBodyType, RequestHandler, http, HttpResponse } from 'msw';

export interface CarbonioMailboxRestGenericRequest {
	Body: any;
}

export interface CarbonioMailboxRestGenericResponse {
	Body: any;
	Header: any;
}

export type CarbonioMailboxRestHandlerRequest<T> = DefaultBodyType & {
	Body: Record<string, T>;
};

const handlers: Array<RequestHandler> = [
	http.get('/test/i18n/en.json', () => HttpResponse.json({}))
];

export const getRestHandlers = (): Array<RequestHandler> => [...handlers];

export const registerRestHandler = (...handler: Array<RequestHandler>): void => {
	handlers.push(...handler);
};
