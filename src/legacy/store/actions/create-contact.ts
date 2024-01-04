/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { Contact } from '../../types/contact';
import { normalizeContactToSoap } from '../../utils/normalizations/normalize-contact-to-soap';

export const createContact = createAsyncThunk(
	'contacts/createContact',
	async (contact: Contact) => {
		const cnt = { ...contact, fileAsStr: contact.firstName };
		const { cn } = (await soapFetch('CreateContact', {
			_jsns: 'urn:zimbraMail',
			cn: {
				m: [],
				l: cnt.parent,
				a: normalizeContactToSoap(cnt)
			}
		})) as { cn: any };
		return cn;
	}
);
