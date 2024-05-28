/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

export const moveContactsStoreAction = createAsyncThunk(
	'contacts/moveContactsAction',
	async ({
		contactsIds,
		destinationId,
		actionExecutor
	}: {
		contactsIds: Array<string>;
		destinationId: string;
		actionExecutor: () => Promise<void>;
	}) => actionExecutor()
);
