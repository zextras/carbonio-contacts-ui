/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { times } from 'lodash';

import { UsersSharesList } from './users-shares-list';
import {
	makeListItemsVisible,
	screen,
	setupTest
} from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { ShareInfo } from '../../../model/share-info';
import { buildShareInfo } from '../../../tests/model-builder';

describe('UsersSharesList', () => {
	it('should display an item for each owner of the shares list', async () => {
		const owners = faker.helpers.uniqueArray(faker.person.fullName, 10);

		const shares = owners.reduce<Array<ShareInfo>>((result, ownerName): Array<ShareInfo> => {
			const ownerShares = times(faker.number.int({ min: 1, max: 10 }), () =>
				buildShareInfo({ ownerName })
			);
			return result.concat(ownerShares);
		}, []);

		setupTest(<UsersSharesList shares={shares} onSelectionChange={jest.fn()} />);
		makeListItemsVisible();
		expect(await screen.findAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(
			owners.length
		);
	});

	it('should display an item with many shares as children if the owner of the shares is the same', () => {
		const ownerName = faker.person.fullName();
		const ownerId = faker.string.uuid();
		const ownerEmail = faker.internet.email();

		const shares = times(faker.number.int({ min: 2, max: 20 }), () =>
			buildShareInfo({ ownerName, ownerId, ownerEmail })
		);

		setupTest(<UsersSharesList shares={shares} onSelectionChange={jest.fn()} />);
		makeListItemsVisible();
		expect(screen.getAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(1);
		expect(screen.getAllByTestId(TESTID_SELECTORS.checkbox)).toHaveLength(shares.length);
	});

	it('should call the onSelectionChange callback, passing all the selected shares, when the user select shares from different owners in the list', async () => {
		const owners = faker.helpers.uniqueArray(faker.person.fullName, 10);

		const shares = owners.reduce<Array<ShareInfo>>(
			(result, ownerName): Array<ShareInfo> =>
				times(faker.number.int({ min: 1, max: 10 }), () => buildShareInfo({ ownerName })),
			[]
		);

		const onSelectionChange = jest.fn();
		const { user } = setupTest(
			<UsersSharesList shares={shares} onSelectionChange={onSelectionChange} />
		);
		makeListItemsVisible();
		const checkboxes = screen.getAllByTestId(TESTID_SELECTORS.checkbox);
		checkboxes.forEach((checkbox) => act(() => user.click(checkbox)));

		expect(onSelectionChange).toHaveBeenCalledWith(expect.arrayContaining(shares));
	});

	it.todo(
		'should call the onSelectionChange callback, passing an empty array, if the user deselect all the shares previously selected from different owners'
	);
});
