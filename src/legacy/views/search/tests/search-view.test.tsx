/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { act, waitFor, within } from '@testing-library/react';
import { Button } from '@zextras/carbonio-design-system';
import { QueryChip, SearchViewProps, useQuery } from '@zextras/carbonio-search-ui';
import * as hooks from '@zextras/carbonio-shell-ui';
import { AccountSettings } from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';
import { HttpResponse } from 'msw';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { generateSettings } from '../../../../carbonio-ui-commons/test/mocks/settings/settings-generator';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import {
	makeListItemsVisible,
	screen,
	setupTest
} from '../../../../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../../../../constants/tests';
import { CnItem } from '../../../../network/api/types';
import { createSoapContact, createSoapContactGroupV2 } from '../../../../tests/utils';
import { SearchContactsRequest, SearchContactsSoapResponse } from '../../../../types';
import { type SoapContact } from '../../../types/soap';
import { Query } from '../search-types';
import SearchView from '../search-view';

const useMockedUseQuery = (): ReturnType<typeof useQuery> => {
	const queryChip: QueryChip = {
		hasAvatar: false,
		id: '0',
		label: 'test'
	};
	const [query, updateQuery] = useState<Query>([queryChip]);
	return [query, updateQuery];
};

const TestSearchView = (props: SearchViewProps): React.JSX.Element => {
	const [query, updateQuery] = useMockedUseQuery();
	return (
		<>
			<Button onClick={(): void => updateQuery([])} data-testid={'clear-search-button'} />
			<SearchView {...props} useQuery={(): ReturnType<typeof useQuery> => [query, updateQuery]} />
		</>
	);
};

const setupSearch = ({ contacts }: { contacts: Array<CnItem | SoapContact> }): SearchViewProps => {
	const customSettings: Partial<AccountSettings> = {
		prefs: {
			zimbraPrefIncludeTrashInSearch: 'TRUE',
			zimbraPrefIncludeSharedItemsInSearch: 'FALSE'
		}
	};
	const settings = generateSettings(customSettings);
	jest.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
	createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
		cn: contacts,
		more: false,
		offset: 0,
		sortBy: 'nameAsc'
	});
	const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

	return {
		useQuery: useMockedUseQuery,
		ResultsHeader: resultsHeader,
		useDisableSearch: (): [boolean, () => void] => [false, noop]
	};
};

describe('SearchView', () => {
	it('should render the basic elements of the view API fulfilled', async () => {
		const customSettings: Partial<AccountSettings> = {
			prefs: {
				zimbraPrefIncludeTrashInSearch: 'TRUE',
				zimbraPrefIncludeSharedItemsInSearch: 'FALSE'
			}
		};
		const settings = generateSettings(customSettings);
		jest.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
		const queryChip: QueryChip = {
			hasAvatar: false,
			id: '0',
			label: 'test'
		};
		const soapContact: SoapContact = createSoapContact({});
		const searchInterceptor = createSoapAPIInterceptor<
			SearchContactsRequest,
			SearchContactsSoapResponse
		>('Search', {
			cn: [soapContact],
			more: false,
			offset: 0,
			sortBy: 'nameAsc'
		});
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

		const mockedUseQuery = jest.fn().mockReturnValue([[queryChip], noop]);
		const searchViewProps: SearchViewProps = {
			useQuery: mockedUseQuery,
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		setupTest(<SearchView {...searchViewProps} />);
		await searchInterceptor;

		expect(await screen.findByText('Results for:')).toBeInTheDocument();
		expect(await screen.findByText(/Advanced filter/i)).toBeInTheDocument();
		expect(
			await screen.findByText('Select one or more results to perform actions or display details.')
		).toBeInTheDocument();
	});

	it('does not make search if query is empty', async () => {
		const customSettings: Partial<AccountSettings> = {
			prefs: {
				zimbraPrefIncludeTrashInSearch: 'TRUE',
				zimbraPrefIncludeSharedItemsInSearch: 'FALSE'
			}
		};
		const settings = generateSettings(customSettings);
		jest.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;
		const mockedUseQuery = jest.fn().mockReturnValue([[], noop]);
		const searchAPIInterceptor = createAPIInterceptor(
			'post',
			'/service/soap/SearchRequest',
			HttpResponse.json({})
		);
		const searchViewProps: SearchViewProps = {
			useQuery: mockedUseQuery,
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		setupTest(<SearchView {...searchViewProps} />);

		expect(searchAPIInterceptor.getCalledTimes()).toBe(0);
	});

	it('should clear the search when clear search button is pressed', async () => {
		const soapContact = createSoapContact({
			id: '1',
			email: 'testContact1@demo.com',
			folderId: FOLDERS.CONTACTS
		});

		const { user } = setupTest(<TestSearchView {...setupSearch({ contacts: [soapContact] })} />);
		await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);

		const clearButton = await screen.findByTestId('clear-search-button');
		await user.click(clearButton);

		await waitFor(() =>
			expect(
				screen.queryByTestId(`search-contact-list-item-${soapContact.id}`)
			).not.toBeInTheDocument()
		);
	});

	describe('Advanced Filter Modal', () => {
		it('search from modal with same query should re-run the search when search button is pressed', async () => {
			const soapContact = createSoapContact({
				id: '1',
				email: 'testContact1@demo.com',
				folderId: FOLDERS.CONTACTS
			});
			const soapContact2 = createSoapContact({
				id: '2',
				email: 'testContact2@demo.com',
				folderId: FOLDERS.CONTACTS
			});

			const { user } = setupTest(<SearchView {...setupSearch({ contacts: [soapContact] })} />);

			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);
			await user.click(await screen.findByRole('button', { name: 'Advanced Filters' }));
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
				cn: [soapContact, soapContact2],
				more: false,
				offset: 0,
				sortBy: 'nameAsc'
			});

			const filterModal = await screen.findByTestId('advanced-filter-modal');
			const searchButton = await within(filterModal).findByRole('button', { name: 'Search' });
			await user.click(searchButton);

			expect(
				await screen.findByTestId(`search-contact-list-item-${soapContact2.id}`)
			).toBeVisible();
		});

		it('re-running the search should should clear the search list before populating with new results', async () => {
			const soapContact = createSoapContact({
				id: '1',
				email: 'testContact1@demo.com',
				folderId: FOLDERS.CONTACTS
			});

			const { user } = setupTest(<SearchView {...setupSearch({ contacts: [soapContact] })} />);

			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);
			await user.click(await screen.findByRole('button', { name: 'Advanced Filters' }));
			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});
			createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
				cn: [soapContact],
				more: false,
				offset: 0,
				sortBy: 'nameAsc'
			});

			const filterModal = await screen.findByTestId('advanced-filter-modal');
			const searchButton = await within(filterModal).findByRole('button', { name: 'Search' });
			await user.click(searchButton);

			await waitFor(() =>
				expect(
					screen.queryByTestId(`search-contact-list-item-${soapContact.id}`)
				).not.toBeInTheDocument()
			);
			expect(
				await screen.findByTestId(`search-contact-list-item-${soapContact.id}`)
			).toBeInTheDocument();
		});
	});

	describe('Contacts', () => {
		it('should display the selected contact in the detail panel', async () => {
			populateFoldersStore();
			const email = 'testContact@demo.com';
			const soapContact = createSoapContact({
				id: '1',
				email,
				folderId: FOLDERS.CONTACTS
			});

			const searchViewProps = setupSearch({ contacts: [soapContact] });
			const { user } = setupTest(<SearchView {...searchViewProps} />);
			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);
			makeListItemsVisible();
			const clickableItem = await screen.findByText(email);
			await user.click(clickableItem);

			expect(await screen.findByTestId('contact-displayer')).toBeVisible();
		});
		it('should display the actions on hover', async () => {
			populateFoldersStore();
			const email = 'testContact@demo.com';
			const soapContact = createSoapContact({
				id: '1',
				email,
				folderId: FOLDERS.CONTACTS
			});

			const searchViewProps = setupSearch({ contacts: [soapContact] });
			const { user } = setupTest(<SearchView {...searchViewProps} />);
			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);
			makeListItemsVisible();
			const clickableItem = await screen.findByText(email);

			await act(() => user.hover(clickableItem));
			const sendEmailButton = await screen.findByTestId('icon: MailModOutline');
			expect(sendEmailButton).toBeVisible();
			const moveEmailButton = await screen.findByTestId('icon: MoveOutline');
			expect(moveEmailButton).toBeVisible();
			const trashEmailButton = await screen.findByTestId('icon: Trash2Outline');
			expect(trashEmailButton).toBeVisible();
			const editEmailButton = await screen.findByTestId('icon: Edit2Outline');
			expect(editEmailButton).toBeVisible();
		});
	});

	describe('Contact Groups', () => {
		it('should display the selected contact group in detail panel', async () => {
			populateFoldersStore();
			const soapContactGroup = createSoapContactGroupV2({
				contactGroupName: 'Test Contact Group',
				folderId: FOLDERS.CONTACTS
			});

			const searchViewProps = setupSearch({ contacts: [soapContactGroup] });
			const { user } = setupTest(<SearchView {...searchViewProps} />);
			const listItem = await screen.findByText('Test Contact Group');
			await user.click(listItem);

			expect(await screen.findByTestId('contact-group-displayer')).toBeVisible();
		});
		it('should display the actions on hover', async () => {
			populateFoldersStore();
			const soapContactGroup = createSoapContactGroupV2({
				contactGroupName: 'Test Contact Group 1',
				folderId: FOLDERS.CONTACTS
			});

			const searchViewProps = setupSearch({ contacts: [soapContactGroup] });
			const { user } = setupTest(<SearchView {...searchViewProps} />);
			const listItem = await screen.findByText('Test Contact Group 1');

			await act(() => user.hover(listItem));
			const sendEmailButton = await screen.findByTestId('icon: EmailOutline');
			expect(sendEmailButton).toBeVisible();
			const moveEmailButton = await screen.findByTestId('icon: MoveOutline');
			expect(moveEmailButton).toBeVisible();
			const trashEmailButton = await screen.findByTestId('icon: Trash2Outline');
			expect(trashEmailButton).toBeVisible();
			const editEmailButton = await screen.findByTestId('icon: Edit2Outline');
			expect(editEmailButton).toBeVisible();
		});
	});
});
