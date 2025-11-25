/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { within } from '@testing-library/react';
import { ChipAction } from '@zextras/carbonio-design-system';
import {
	EDIT_ACTION_ID,
	CONTACT_TYPES,
	ContactInputItem,
	JSNS
} from '@zextras/carbonio-ui-commons';

import { screen, UserEvent } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { TESTID_SELECTORS } from 'constants/tests';
import { FullAutocompleteRequest, FullAutocompleteResponse } from 'legacy/types/contact';
import { GetContactsRequest, GetContactsResponse } from 'legacy/types/soap';
import {
	GetDistributionListRequest,
	GetDistributionListResponse
} from 'network/api/get-distribution-list';

export const SHOW_MORE = /show more/i;
export const SELECT_ALL = /Select address|Select all \d+ addresses/;

export const editValidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: EDIT_ACTION_ID,
	label: 'Edit E-mail',
	icon: 'EditOutline',
	type: 'button'
});

export const editInvalidChipAction: ChipAction = expect.objectContaining<Partial<ChipAction>>({
	id: EDIT_ACTION_ID,
	label: 'E-mail is invalid, click to edit it',
	icon: 'EditOutline',
	type: 'button'
});

export const createSimpleChip = ({
	id = 'simple_chip',
	label = 'Simple chip',
	email = 'simple@chip.com'
}: {
	id?: string;
	label?: string;
	email?: string;
} = {}): ContactInputItem => ({
	id,
	label,
	value: {
		id,
		email,
		type: CONTACT_TYPES.CONTACT
	}
});

export const createDistributionListChip = (email: string): ContactInputItem => ({
	id: email,
	label: email,
	value: {
		id: email,
		email,
		type: CONTACT_TYPES.DISTRIBUTION_LIST
	}
});

export const generateGroupMemberChip = (email: string): ContactInputItem => ({
	id: email,
	label: email,
	error: false,
	actions: [editValidChipAction],
	value: {
		id: email,
		email,
		type: CONTACT_TYPES.CONTACT
	}
});

export const typeAndSelectOptionFromDropdown = async (
	user: UserEvent,
	textToFind: string
): Promise<void> => {
	await user.type(screen.getByRole('textbox'), 'a');

	const dropdown = await screen.findByTestId(TESTID_SELECTORS.dropdownList);
	const dropdownItem = await within(dropdown).findAllByText(textToFind);
	await user.click(dropdownItem[0]);
};

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
			_jsns: JSNS.ACCOUNT,
			dl
		}
	);

export const clickExpandDL = async (
	user: UserEvent,
	parentElement?: HTMLElement
): Promise<void> => {
	const expandIcon = parentElement
		? await within(parentElement).findByTestId(TESTID_SELECTORS.icons.expandDL)
		: await screen.findByTestId(TESTID_SELECTORS.icons.expandDL);
	await user.click(expandIcon);
};

export const clickCollapseDL = async (user: UserEvent): Promise<void> => {
	await user.click(
		await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.collapseDL })
	);
};

export const selectAllMembersInDL = async (user: UserEvent): Promise<void> => {
	await user.click(await screen.findByRole('button', { name: SELECT_ALL }));
};
