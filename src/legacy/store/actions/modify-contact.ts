/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { Contact } from 'legacy/types/contact';
import { ModifyContactRequest, SoapContact } from 'legacy/types/soap';
import { normalizeContactToSoap } from 'legacy/utils/normalizations/normalize-contact-to-soap';
import { ModifyContactResponse } from 'network/api/modify-contact';

export const modifyContact = async ({
	updatedContact
}: {
	updatedContact: Contact;
}): Promise<SoapContact> => {
	const { cn } = await legacySoapFetch<ModifyContactRequest, ModifyContactResponse>(
		'ModifyContact',
		{
			_jsns: 'urn:zimbraMail',
			force: '1',
			replace: '0',
			cn: {
				m: [],
				id: updatedContact.id,
				a: normalizeContactToSoap(updatedContact)
			}
		}
	);
	return cn[0];
};
