/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { within } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';

import { createSoapAPIInterceptor } from '../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from '../../../network/api/get-distribution-list';
import { FullAutocompleteRequest, FullAutocompleteResponse } from '../../types/contact';
import { GetContactsRequest, GetContactsResponse } from '../../types/soap';
import { ContactInputItem, USER_TYPES } from '../types';

export const createSimpleChipItem = (
	id = '1',
	label = 'test',
	email = 'test@test.com'
): ContactInputItem => ({
	id,
	label,
	value: {
		id,
		email,
		type: USER_TYPES.CONTACT
	}
});

export const typeAndSelectOption = async (user: any, textToFind: string): Promise<void> => {
	await user.type(screen.getByRole('textbox'), 'a');

	const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
	const dropdownItem = await within(dropdown).findAllByText(textToFind);
	await user.click(dropdownItem[0]);
};

export const editValidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: 'action1',
	label: 'Edit E-mail',
	icon: 'EditOutline',
	type: 'button'
});

export const editInvalidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: 'action1',
	label: 'E-mail is invalid, click to edit it',
	icon: 'EditOutline',
	type: 'button'
});

export const createAutocompleteInterceptor = (
	contacts: FullAutocompleteResponse['match']
): Promise<FullAutocompleteRequest> =>
	createSoapAPIInterceptor<FullAutocompleteRequest, FullAutocompleteResponse>('FullAutocomplete', {
		canBeCached: true,
		match: contacts
	});

export const createGetContactRequestInterceptor = (
	cn: GetContactsResponse['cn']
): Promise<GetContactsRequest> =>
	createSoapAPIInterceptor<GetContactsRequest, GetContactsResponse>('GetContacts', { cn });

export const createGetDistributionListInterceptor = (
	dl: GetDistributionListResponse['dl']
): Promise<GetDistributionListRequest> =>
	createSoapAPIInterceptor<GetDistributionListRequest, GetDistributionListResponse>(
		'GetDistributionList',
		{
			_jsns: 'urn:zimbraAccount',
			dl
		}
	);
