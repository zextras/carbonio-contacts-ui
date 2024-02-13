/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { Contact } from '../../types/contact';
import { normalizeContactToSoap } from '../../utils/normalizations/normalize-contact-to-soap';

export const modifyContact = createAsyncThunk(
	'contacts/modifyContact',
	async ({ updatedContact }: { updatedContact: Contact; editContact: Contact }) => {
		const { cn } = (await soapFetch('ModifyContact', {
			_jsns: 'urn:zimbraMail',
			force: '1',
			replace: '0',
			cn: {
				m: [],
				id: updatedContact.id,
				a: normalizeContactToSoap(updatedContact)
			}
		})) as { cn: any };
		return cn;
	}
);
