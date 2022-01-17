/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { reduce } from 'lodash';

export const getContacts = createAsyncThunk('contacts/gets contacts', async (ids: string[]) => {
	const currentContacts: { [id: string]: string }[] = [];
	reduce(
		ids,
		(acc, v) => {
			acc.push({ id: v });
			return acc;
		},
		currentContacts
	);
	const { cn } = (await soapFetch('GetContacts', {
		_jsns: 'urn:zimbraMail',
		cn: currentContacts
	})) as { cn: any };
	return cn;
});
