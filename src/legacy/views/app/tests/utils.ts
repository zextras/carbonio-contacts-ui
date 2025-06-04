/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { CnItem } from '../../../../network/api/types';
import { SearchContactsSoapRequest } from '../../../../types';
import { SoapContact } from '../../../types/soap';
import { makeListItemsVisible, screen } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

export function createContactsApiInterceptor({
	items,
	more = false
}: {
	items: (CnItem | SoapContact)[];
	more?: boolean;
}): Promise<SearchContactsSoapRequest> {
	return createSoapAPIInterceptor('Search', {
		sortBy: 'nameAsc',
		offset: 0,
		cn: items,
		more
	});
}

export const findContactInList = async (contact: SoapContact): Promise<void> => {
	await screen.findByTestId(`custom-contact-list-item-${contact.id}`);
	makeListItemsVisible();
};
