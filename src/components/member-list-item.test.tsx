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
	isOwner = false,
	onRemove = jest.fn()
}: Partial<MemberListItemComponentProps> = {}): MemberListItemComponentProps => ({
	email,
	isOwner,
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

	it('should show the label manager if the member is an owner', () => {
		setupTest(<MemberListItemComponent {...buildProps({ isOwner: true })} />);
		expect(screen.getByText('Manager')).toBeVisible();
	});

	it('should not show the label manager if the member is not an owner', () => {
		setupTest(<MemberListItemComponent {...buildProps({ isOwner: false })} />);
		expect(screen.queryByText('Manager')).not.toBeInTheDocument();
	});

	it('should show the remove action button', () => {
		setupTest(<MemberListItemComponent {...buildProps()} />);
		expect(
			screen.getByRoleWithIcon('button', {
				name: 'remove',
				icon: TESTID_SELECTORS.ICONS.REMOVE_MEMBER
			})
		).toBeVisible();
	});
});
