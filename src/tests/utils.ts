/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapResponse, SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { EventEmitter } from 'events';
import { times } from 'lodash';

import { screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';
import { DistributionList, DistributionListMembersPage } from '../model/distribution-list';
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

export const buildSoapError = (error: string): ErrorSoapResponse => ({
	Header: {
		context: {}
	},
	Body: {
		Fault: {
			Reason: {
				Text: error
			},
			Detail: {
				Error: {
					Code: error,
					Detail: error
				}
			}
		}
	}
});

export const generateDistributionList = (
	data: Partial<DistributionList> = {}
): MakeRequired<DistributionList, 'displayName'> => ({
	id: faker.string.uuid(),
	email: faker.internet.email(),
	displayName: faker.internet.displayName(),
	isOwner: faker.datatype.boolean(),
	isMember: faker.datatype.boolean(),
	canRequireMembers: true,
	...data
});

export const generateDistributionListMembersPage = (
	members: string[] = []
): DistributionListMembersPage => ({
	members,
	total: members.length,
	more: false
});

export const generateDistributionLists = (
	limit = 10,
	defaultData: Partial<DistributionList> = {}
): Array<ReturnType<typeof generateDistributionList>> =>
	times(limit, () => generateDistributionList(defaultData));

// utility to make msw respond in a controlled way
// see https://github.com/mswjs/msw/discussions/1307
export async function delayUntil(emitter: EventEmitter, event: string): Promise<void> {
	return new Promise((resolve) => {
		emitter.once(event, resolve);
	});
}
