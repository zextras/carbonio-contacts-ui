/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SearchContactsSoapRequest, SearchContactsSoapResponse } from '../../types';

export const searchContactsByQueryAsyncThunk = createAsyncThunk<
	SearchContactsSoapResponse,
	SearchContactsSoapRequest
>('contacts/searchContacts', async (request) =>
	soapFetch<SearchContactsSoapRequest, SearchContactsSoapResponse>('Search', request)
);
