/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen, within } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

export const getDLContactInput = (): {
	container: HTMLElement;
	textbox: HTMLElement;
	addMembersIcon: HTMLElement;
} => {
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
