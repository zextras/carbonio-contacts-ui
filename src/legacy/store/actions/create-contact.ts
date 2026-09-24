/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { Contact } from 'legacy/types/contact';
import { SoapContact } from 'legacy/types/soap';
import { normalizeContactToSoap } from 'legacy/utils/normalizations/normalize-contact-to-soap';

export const createContact = async (contact: Contact): Promise<SoapContact> => {
	const { cn } = (await legacySoapFetch('CreateContact', {
		_jsns: 'urn:zimbraMail',
		cn: {
			m: [],
			l: contact.parent,
			a: normalizeContactToSoap(contact)
		}
	})) as { cn: any };
	return cn;
};
