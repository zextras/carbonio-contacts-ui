/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { Contact } from '../../types/contact';
import { normalizeContactToSoap } from '../normalizations/normalize-contact-to-soap';

export const createContact = createAsyncThunk(
	'contacts/createContact',
	async (contact: Contact) => {
		const { cn } = (await soapFetch('CreateContact', {
			_jsns: 'urn:zimbraMail',
			cn: {
				m: [],
				l: contact.parent,
				a: normalizeContactToSoap(contact)
			}
		})) as { cn: any };
		return cn;
	}
);
