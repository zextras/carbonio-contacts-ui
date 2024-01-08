/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import { MakeRequired } from '../types/utils';

export const getDLContactInput = (): {
	container: HTMLElement;
	textbox: HTMLElement;
	addMembersIcon: HTMLElement;
} => {
	// TODO check if it is possible to add more criteria beside the test-id
	const contactInput = screen.getByTestId(TESTID_SELECTORS.contactInput);
	const contactInputTextBox = within(contactInput).getByRole('textbox', {
		name: /Type an address, click '\+' to add to the distribution list/i
	});
	const contactInputIcon = within(contactInput).getByRoleWithIcon('button', {
		icon: TESTID_SELECTORS.icons.addMembers
	});

	return {
		container: contactInput,
		textbox: contactInputTextBox,
		addMembersIcon: contactInputIcon
	};
};
export const buildSoapResponse = <T>(responseData: Record<string, T>): SuccessSoapResponse<T> => ({
	Header: {
		context: {}
	},
	Body: responseData
});

export const generateDistributionList = (
	data: Partial<DistributionList> = {}
): MakeRequired<DistributionList, 'displayName'> => ({
	id: faker.string.uuid(),
	email: faker.internet.email(),
	displayName: faker.internet.displayName(),
	isOwner: faker.datatype.boolean(),
	isMember: faker.datatype.boolean(),
	...data
});

export const generateDistributionLists = (
	limit = 10
): Array<ReturnType<typeof generateDistributionList>> =>
	times(limit, () => generateDistributionList());
