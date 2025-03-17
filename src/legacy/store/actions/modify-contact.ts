/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { Contact } from '../../types/contact';
import { SoapContact } from '../../types/soap';
import { normalizeContactToSoap } from '../../utils/normalizations/normalize-contact-to-soap';

export const modifyContact = async ({
	updatedContact
}: {
	updatedContact: Contact;
}): Promise<SoapContact> => {
	const { cn } = (await soapFetch('ModifyContact', {
		_jsns: 'urn:zimbraMail',
		force: '1',
		replace: '0',
		cn: {
			m: [],
			id: updatedContact.id,
			a: normalizeContactToSoap(updatedContact)
		}
	})) as { cn: Array<SoapContact> };
	return cn[0];
};
