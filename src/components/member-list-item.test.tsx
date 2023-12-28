/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';

import { MemberListItemComponent, MemberListItemComponentProps } from './member-list-item';
import { setupTest, screen } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../constants/tests';

const buildProps = ({
	email = '',
	onRemove = jest.fn()
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
		expect(screen.getByTestId(TESTID_SELECTORS.AVATAR)).toBeVisible();
	});

	it('should show the remove action button', () => {
		setupTest(<MemberListItemComponent {...buildProps()} />);
		expect(
			screen.getByRoleWithIcon('button', {
				name: 'remove',
				icon: TESTID_SELECTORS.icons.REMOVE_MEMBER
			})
		).toBeVisible();
	});

	it('should call onRemove callback when user clicks on remove button', async () => {
		const removeFn = jest.fn();
		const { user } = setupTest(<MemberListItemComponent {...buildProps({ onRemove: removeFn })} />);
		await user.click(screen.getByRole('button', { name: 'remove' }));
		expect(removeFn).toHaveBeenCalled();
	});
});
