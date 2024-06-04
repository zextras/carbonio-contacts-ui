/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';

export const registerUploadHandler = (response?: string): void =>
	getSetupServer().use(http.post(`/service/upload`, ({ request }) => HttpResponse.text(response)));
