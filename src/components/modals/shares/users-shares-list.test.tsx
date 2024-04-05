/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { ShareInfo } from '../../../model/share-info';
import { buildShareInfo } from '../../../tests/model-builder';

describe('UsersSharesList', () => {
	it('should display an item for each owner of the shares list', () => {
		const owners = faker.helpers.uniqueArray(faker.person.fullName, 10);

		const shares = owners.reduce<Array<ShareInfo>>(
			(result, ownerName): Array<ShareInfo> =>
				times(faker.number.int({ min: 1, max: 10 }), () => buildShareInfo({ ownerName })),
			[]
		);

		setupTest(<UsersSharesList shares={shares} onSelectionChange={jest.fn()} />);
		expect(screen.getAllByTestId(TESTID_SELECTORS.sharesUsersListItem)).toHaveLength(owners.length);
	});

	it.todo(
		'should call the onSelectionChange callback, passing the selected shares, when the user select two share from different owners in the list'
	);
});
