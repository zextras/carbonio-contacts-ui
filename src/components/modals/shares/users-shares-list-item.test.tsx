/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { times } from 'lodash';

import { UsersSharesListItem } from './users-shares-list-item';
import {
	makeListItemsVisible,
	screen,
	setupTest
} from '../../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../../constants/tests';
import { buildShareInfo } from '../../../tests/model-builder';

describe('UsersSharesListItem', () => {
	it('should display an expanded accordion', () => {
		const shares = [buildShareInfo()];

		setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={faker.person.fullName()}
				onDeselect={jest.fn()}
				onSelect={jest.fn()}
			/>
		);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.accordionCollapseAction)).toBeVisible();
	});

	it('should display a description containing the name of the owner', () => {
		const ownerName = faker.person.fullName();
		const shares = [buildShareInfo({ ownerName })];

		setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={ownerName}
				onDeselect={jest.fn()}
				onSelect={jest.fn()}
			/>
		);
		expect(screen.getByText(`${ownerName}'s shared address books`)).toBeVisible();
	});

	it('should display an icon', () => {
		const shares = [buildShareInfo()];

		setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={faker.person.fullName()}
				onDeselect={jest.fn()}
				onSelect={jest.fn()}
			/>
		);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.sharesUser));
	});

	it("should display the user's shares as children of the accordion", () => {
		const ownerName = faker.person.fullName();
		const ownerEmail = faker.internet.email();
		const ownerId = faker.string.uuid();
		const sharesCount = 4;
		const shares = times(sharesCount, () => buildShareInfo({ ownerName, ownerId, ownerEmail }));

		setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={ownerName}
				onDeselect={jest.fn()}
				onSelect={jest.fn()}
			/>
		);
		makeListItemsVisible();
		expect(screen.getAllByTestId(TESTID_SELECTORS.checkbox)).toHaveLength(sharesCount);
	});

	it('should call the onSelected callback, passing the selected share, when the user select a share from the list', async () => {
		const onSelected = jest.fn();
		const onDeselected = jest.fn();
		const ownerName = faker.person.fullName();
		const ownerEmail = faker.internet.email();
		const ownerId = faker.string.uuid();
		const sharesCount = 6;
		const shares = times(sharesCount, (index) =>
			buildShareInfo({ ownerName, ownerId, ownerEmail, folderPath: `/share-${index}` })
		);

		const randomShareIndex = faker.number.int({ min: 0, max: sharesCount - 1 });
		const randomShare = shares[randomShareIndex];

		const { user } = setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={ownerName}
				onSelect={onSelected}
				onDeselect={onDeselected}
			/>
		);
		makeListItemsVisible();

		// This is needed to ensure that the list elements will be visible and clickable
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await act(() => user.click(screen.getByText(`share-${randomShareIndex}`)));
		expect(onSelected).toHaveBeenCalledWith(randomShare);
	});

	it('should call the onDeselected callback, passing the deselected share, when the user deselect a share from the list', async () => {
		const onSelected = jest.fn();
		const onDeselected = jest.fn();
		const ownerName = faker.person.fullName();
		const ownerEmail = faker.internet.email();
		const ownerId = faker.string.uuid();
		const sharesCount = 9;
		const shares = times(sharesCount, (index) =>
			buildShareInfo({ ownerName, ownerId, ownerEmail, folderPath: `/share-${index}` })
		);

		const randomShareIndex = faker.number.int({ min: 0, max: sharesCount - 1 });
		const randomShare = shares[randomShareIndex];

		const { user } = setupTest(
			<UsersSharesListItem
				shares={shares}
				ownerName={ownerName}
				onSelect={onSelected}
				onDeselect={onDeselected}
			/>
		);
		makeListItemsVisible();

		// This is needed to ensure that the list elements will be visible and clickable
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		await act(() => user.click(screen.getByText(`share-${randomShareIndex}`)));
		await act(() => user.click(screen.getByText(`share-${randomShareIndex}`)));
		expect(onDeselected).toHaveBeenCalledWith(randomShare);
	});
});
