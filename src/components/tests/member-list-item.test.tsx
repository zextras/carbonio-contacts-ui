/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { vi } from 'vitest';

import { setupTest, screen } from '@test-setup';
import { MemberListItemComponent, MemberListItemComponentProps } from 'components/member-list-item';
import { TESTID_SELECTORS } from 'constants/tests';

const buildProps = ({
	email = '',
	onRemove = vi.fn()
}: Partial<MemberListItemComponentProps> = {}): MemberListItemComponentProps => ({
	email,
	onRemove
});

describe('Member item', () => {
	it('should show the email of the member', () => {
		const email = faker.internet.email();
		setupTest(<MemberListItemComponent {...buildProps({ email })} />);
		expect(screen.getByText(email)).toBeVisible();
	});

	it('should show the avatar', () => {
		const email = faker.internet.email();
		setupTest(<MemberListItemComponent {...buildProps({ email })} />);
		expect(screen.getByTestId(TESTID_SELECTORS.avatar)).toBeVisible();
	});

	it('should show the remove action button', () => {
		setupTest(<MemberListItemComponent {...buildProps()} />);
		expect(
			screen.getByRoleWithIcon('button', {
				name: 'remove',
				icon: TESTID_SELECTORS.icons.removeMembers
			})
		).toBeVisible();
	});

	it('should call onRemove callback when user clicks on remove button', async () => {
		const removeFn = vi.fn();
		const { user } = setupTest(<MemberListItemComponent {...buildProps({ onRemove: removeFn })} />);
		await user.click(screen.getByRole('button', { name: 'remove' }));
		expect(removeFn).toHaveBeenCalled();
	});
});
