/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';

export const contactAction = async ({
	contactsIDs,
	destinationID,
	op,
	tagName
}: {
	contactsIDs: Array<string>;
	destinationID?: string;
	op: string;
	tagName: string;
}): Promise<unknown> => {
	const ids = contactsIDs.join(',');

	return soapFetch('ContactAction', {
		_jsns: 'urn:zimbraMail',
		action: omitBy(
			{
				id: ids,
				op,
				l: destinationID,
				tn: tagName
			},
			isNil
		)
	});
};
