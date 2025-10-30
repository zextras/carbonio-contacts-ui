/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';
import * as clipboard from '@zextras/carbonio-ui-commons';
import { vi } from 'vitest';

import { screen, setupTest, within } from '@test-setup';
import { MemberDisplayerListItemComponent } from 'components/member-displayer-list-item';
import { TESTID_SELECTORS } from 'constants/tests';

vi.mock('@zextras/carbonio-ui-commons', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		...actual,
		copyToClipboard: vi.fn()
	};
});

describe('Member displayer item', () => {
	it('should show the email of the member', () => {
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(screen.getByText(email)).toBeVisible();
	});

	it('should show the avatar', () => {
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(screen.getByTestId(TESTID_SELECTORS.avatar)).toBeVisible();
	});

	it('should show the send email action button if the Mails integration is available', () => {
		vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([vi.fn(), true]);
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
		).toBeVisible();
	});

	it('should not show the send email action button if the Mails integration is not available', () => {
		vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([vi.fn(), false]);
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(
			screen.queryByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail })
		).not.toBeInTheDocument();
	});

	it('should show the copy address action button', () => {
		const email = faker.internet.email();
		setupTest(<MemberDisplayerListItemComponent email={email} />);
		expect(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy })).toBeVisible();
	});

	it('should call the send email integration function when user clicks on send mail button', async () => {
		const openMailComposer = vi.fn();
		vi.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
		const email = faker.internet.email();
		const { user } = setupTest(<MemberDisplayerListItemComponent email={email} />);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.sendEmail });
		await user.click(button);
		expect(openMailComposer).toHaveBeenCalledWith({
			recipients: [expect.objectContaining({ email })]
		});
	});

	it('should call copy into clipboard function when user clicks on copy address button', async () => {
		const copyToClipboard = vi
			.spyOn(clipboard, 'copyToClipboard')
			.mockImplementation(() => Promise.resolve());
		const email = faker.internet.email();
		const { user } = setupTest(<MemberDisplayerListItemComponent email={email} />);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy });
		await user.click(button);
		expect(copyToClipboard).toHaveBeenCalledWith(email);
	});

	it('should show a success snackbar after the user clicks on copy address button', async () => {
		vi.spyOn(clipboard, 'copyToClipboard').mockImplementation(() => Promise.resolve());

		const email = faker.internet.email();
		const { user } = setupTest(<MemberDisplayerListItemComponent email={email} />);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.copy });
		await user.click(button);
		const snackbar = await screen.findByTestId(TESTID_SELECTORS.snackbar);
		expect(within(snackbar).getByText(/Email copied to clipboard\./)).toBeVisible();
	});
});
