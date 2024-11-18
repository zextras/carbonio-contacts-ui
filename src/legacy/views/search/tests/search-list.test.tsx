/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';

import { makeListItemsVisible, setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateStore } from '../../../tests/generators/store';
import { Contact } from '../../../types/contact';
import { SearchList } from '../search-list';
import { SearchResults } from '../search-view';

const mockSearch = jest.fn();
const mockSetShowAdvanceFilters = jest.fn();

const mockSearchResults: SearchResults = {
	contacts: [],
	more: false,
	offset: 0,
	sortBy: '',
	query: ''
};

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

const mockSearchResultsWithContacts = {
	...mockSearchResults,
	contacts: mockContacts,
	more: true
};

describe('SearchList', () => {
	it('should renders SearchList with no results', () => {
		const store = generateStore();
		setupTest(
			<SearchList
				searchResults={mockSearchResults}
				search={mockSearch}
				query=""
				filterCount={0}
				setShowAdvanceFilters={mockSetShowAdvanceFilters}
			/>,
			{ store }
		);

		expect(screen.getByTestId('ContactsSearchResultListContainer')).toBeInTheDocument();
		expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
	});

	test('renders contact list items when search results have contacts', () => {
		setupTest(
			<SearchList
				searchResults={mockSearchResultsWithContacts}
				search={mockSearch}
				query=""
				filterCount={0}
				setShowAdvanceFilters={mockSetShowAdvanceFilters}
			/>
		);
		makeListItemsVisible();

		expect(screen.getByTestId('avatar')).toBeVisible();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	test('renders no results when search results have no contacts', async () => {
		const mockSearchResultsWithNoContacts = {
			...mockSearchResults,
			contacts: [],
			more: false
		};
		const store = generateStore();
		setupTest(
			<SearchList
				searchResults={mockSearchResultsWithNoContacts}
				search={mockSearch}
				query=""
				filterCount={0}
				setShowAdvanceFilters={mockSetShowAdvanceFilters}
			/>,
			{ store }
		);

		expect(await screen.findByTestId('displayer-title')).toBeInTheDocument();
	});
});
