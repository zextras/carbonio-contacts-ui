/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { Contact } from 'legacy/types/contact';
import { SoapContact } from 'legacy/types/soap';
import { normalizeContactToSoap } from 'legacy/utils/normalizations/normalize-contact-to-soap';

export const createContact = async (contact: Contact): Promise<SoapContact> => {
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
};
