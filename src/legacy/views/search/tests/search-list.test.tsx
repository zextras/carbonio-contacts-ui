/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';

import { Contact } from 'legacy/types/contact';
import { SearchList } from 'legacy/views/search/search-list';
import { makeListItemsVisible, setupTest } from '@test-setup';

const mockSetShowAdvanceFilters = jest.fn();

const mockContacts: Array<Contact> = [
	{
		URL: {},
		address: {},
		company: '',
		department: '',
		email: {},
		fileAsStr: '',
		firstName: 'John',
		id: '',
		image: '',
		jobTitle: '',
		lastName: 'Doe',
		middleName: '',
		namePrefix: '',
		nameSuffix: '',
		nickName: '',
		notes: '',
		parent: '',
		phone: {}
	}
];
describe('SearchList', () => {
	it('should render the SearchList with no results', () => {
		setupTest(<SearchList contacts={[]} setShowAdvanceFilters={mockSetShowAdvanceFilters} />);

		expect(screen.getByTestId('ContactsSearchResultListContainer')).toBeInTheDocument();
		expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
	});

	test('renders contact list items when search results have contacts', () => {
		setupTest(
			<SearchList contacts={mockContacts} setShowAdvanceFilters={mockSetShowAdvanceFilters} />
		);
		makeListItemsVisible();

		expect(screen.getByTestId('avatar')).toBeVisible();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	test('renders no results when search results have no contacts', async () => {
		setupTest(<SearchList contacts={[]} setShowAdvanceFilters={mockSetShowAdvanceFilters} />);

		expect(await screen.findByTestId('displayer-title')).toBeInTheDocument();
	});
});
