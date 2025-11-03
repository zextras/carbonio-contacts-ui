/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { act, within } from '@testing-library/react';
import { Button } from '@zextras/carbonio-design-system';
import { QueryChip, SearchViewProps, useQuery } from '@zextras/carbonio-search-ui';
import * as hooks from '@zextras/carbonio-shell-ui';
import { AccountSettings } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useFolderStore } from '@zextras/carbonio-ui-commons';
import { noop } from 'lodash';
import { HttpResponse } from 'msw';

import { makeListItemsVisible, screen, setupTest, triggerLoadMore } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import {
	createAPIInterceptor,
	createSoapAPIInterceptor
} from '@test-utils/network/msw/create-api-interceptor';
import { generateSettings } from '@test-utils/settings/settings-generator';
import { populateFoldersStore } from '@test-utils/store/folders';
import { TIMERS } from 'constants/tests';
import { type SoapContact } from 'legacy/types/soap';
import SearchView from 'legacy/views/search/search-view';
import { Query, SearchQueryItem } from 'legacy/views/search/types';
import { CnItem } from 'network/api/types';
import { createSoapContact, createSoapContactGroupV2 } from 'tests/utils';
import {
	SearchContactsRequest,
	SearchContactsSoapRequest,
	SearchContactsSoapResponse
} from 'types/index.d';

const useMockedUseQuery = (): ReturnType<typeof useQuery> => {
	const queryChip: SearchQueryItem = {
		hasAvatar: false,
		id: '0',
		label: 'test'
	};
	const [query, updateQuery] = useState<Query>([queryChip]);
	const wrappedUpdateQuery = (value: QueryChip[] | ((q: QueryChip[]) => QueryChip[])): void => {
		updateQuery(value as Query);
	};
	return [query, wrappedUpdateQuery];
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
	vi.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
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
		vi.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
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

		const mockedUseQuery = vi.fn().mockReturnValue([[queryChip], noop]);
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

	it('should include shared folder in query when PrefIncludeSharedItemsInSearch is true', async () => {
		const sharedFolder = generateFolder({
			id: '3104093b-2f6d-4f16-b409-afabb10d2e1b:234234',
			perm: 'rwx'
		});
		useFolderStore.setState({
			folders: {
				[FOLDERS.USER_ROOT]: generateFolder({
					id: FOLDERS.USER_ROOT,
					children: [generateFolder({ id: FOLDERS.CONTACTS })]
				}),
				[sharedFolder.id]: sharedFolder
			}
		});
		const customSettings: Partial<AccountSettings> = {
			prefs: {
				zimbraPrefIncludeTrashInSearch: 'FALSE',
				zimbraPrefIncludeSharedItemsInSearch: 'TRUE'
			}
		};
		const settings = generateSettings(customSettings);
		vi.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
		const queryChip: QueryChip = {
			hasAvatar: false,
			id: '0',
			label: 'test'
		};
		const soapContact: SoapContact = createSoapContact({});
		const searchInterceptor = createSoapAPIInterceptor<
			SearchContactsSoapRequest,
			SearchContactsSoapResponse
		>('Search', {
			cn: [soapContact],
			more: false,
			offset: 0,
			sortBy: 'nameAsc'
		});
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

		const mockedUseQuery = vi.fn().mockReturnValue([[queryChip], noop]);
		const searchViewProps: SearchViewProps = {
			useQuery: mockedUseQuery,
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		setupTest(<SearchView {...searchViewProps} />);
		const searchContactsRequest = await searchInterceptor;

		expect(searchContactsRequest.query).toEqual(
			`(${queryChip.label}) ( inid:"${sharedFolder.id}" OR is:local) `
		);
	});

	it('should include shared trash folder in query when PrefIncludeTrashInSearch and PrefIncludeSharedItemsInSearch is true', async () => {
		const sharedTrashFolder = generateFolder({
			id: `3104093b-2f6d-4f16-b409-afabb10d2e1b:${FOLDERS.TRASH}`
		});
		useFolderStore.setState({
			folders: {
				[FOLDERS.USER_ROOT]: generateFolder({
					id: FOLDERS.USER_ROOT,
					children: [generateFolder({ id: FOLDERS.CONTACTS })]
				}),
				[sharedTrashFolder.id]: sharedTrashFolder
			}
		});
		const customSettings: Partial<AccountSettings> = {
			prefs: {
				zimbraPrefIncludeTrashInSearch: 'TRUE',
				zimbraPrefIncludeSharedItemsInSearch: 'TRUE'
			}
		};
		const settings = generateSettings(customSettings);
		vi.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
		const queryChip: QueryChip = {
			hasAvatar: false,
			id: '0',
			label: 'test'
		};
		const soapContact: SoapContact = createSoapContact({});
		const searchInterceptor = createSoapAPIInterceptor<
			SearchContactsSoapRequest,
			SearchContactsSoapResponse
		>('Search', {
			cn: [soapContact],
			more: false,
			offset: 0,
			sortBy: 'nameAsc'
		});
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

		const mockedUseQuery = vi.fn().mockReturnValue([[queryChip], noop]);
		const searchViewProps: SearchViewProps = {
			useQuery: mockedUseQuery,
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		setupTest(<SearchView {...searchViewProps} />);
		const searchContactsRequest = await searchInterceptor;

		expect(searchContactsRequest.query).toEqual(
			`(${queryChip.label}) ( inid:"${sharedTrashFolder.id}" OR is:local) `
		);
	});

	it('does not make search if query is empty', async () => {
		const customSettings: Partial<AccountSettings> = {
			prefs: {
				zimbraPrefIncludeTrashInSearch: 'TRUE',
				zimbraPrefIncludeSharedItemsInSearch: 'FALSE'
			}
		};
		const settings = generateSettings(customSettings);
		vi.spyOn(hooks, 'useUserSettings').mockReturnValue(settings);
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;
		const mockedUseQuery = vi.fn().mockReturnValue([[], noop]);
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

		expect(
			screen.queryByTestId(`search-contact-list-item-${soapContact.id}`)
		).not.toBeInTheDocument();
	});

	it('should call the search API and append items to existing results when more items are available to load', async () => {
		const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;
		const mockedUseQuery = vi.fn().mockReturnValue([
			[
				{
					hasAvatar: false,
					id: '0',
					label: 'test'
				}
			],
			noop
		]);
		const searchViewProps: SearchViewProps = {
			useQuery: mockedUseQuery,
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		const soapContact = createSoapContact({
			id: '1',
			email: 'testContact1@demo.com',
			folderId: FOLDERS.CONTACTS
		});

		createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
			cn: [soapContact],
			more: true,
			offset: 0,
			sortBy: 'nameAsc'
		});

		setupTest(<SearchView {...searchViewProps} />);

		await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);

		const soapContact2 = createSoapContact({
			id: '2',
			email: 'testContact2@demo.com',
			folderId: FOLDERS.CONTACTS
		});

		createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
			cn: [soapContact2],
			more: true,
			offset: 0,
			sortBy: 'nameAsc'
		});
		triggerLoadMore();

		expect(
			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`)
		).toBeInTheDocument();
		expect(
			await screen.findByTestId(`search-contact-list-item-${soapContact2.id}`)
		).toBeInTheDocument();
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
				vi.advanceTimersByTime(TIMERS.modal.delayOpen);
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

		it('re-running the search should clear the search list before populating with new results', async () => {
			const soapContact = createSoapContact({
				id: '1',
				email: 'testContact1@demo.com',
				folderId: FOLDERS.CONTACTS
			});

			const { user } = setupTest(<SearchView {...setupSearch({ contacts: [soapContact] })} />);

			await screen.findByTestId(`search-contact-list-item-${soapContact.id}`);
			await user.click(await screen.findByRole('button', { name: 'Advanced Filters' }));
			act(() => {
				vi.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			createSoapAPIInterceptor<SearchContactsRequest, SearchContactsSoapResponse>('Search', {
				cn: [soapContact],
				more: false,
				offset: 0,
				sortBy: 'nameAsc'
			});

			const filterModal = await screen.findByTestId('advanced-filter-modal');
			const searchButton = await within(filterModal).findByRole('button', { name: 'Search' });
			act(() => user.click(searchButton));

			expect(
				screen.queryByTestId(`search-contact-list-item-${soapContact.id}`)
			).not.toBeInTheDocument();
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

			await user.hover(clickableItem);
			const sendEmailButton = await screen.findByTestId('icon: MailModOutline');
			expect(sendEmailButton).toBeInTheDocument();
			expect(sendEmailButton).toBeEnabled();
			const moveEmailButton = await screen.findByTestId('icon: MoveOutline');
			expect(moveEmailButton).toBeInTheDocument();
			expect(moveEmailButton).toBeEnabled();
			const trashEmailButton = await screen.findByTestId('icon: Trash2Outline');
			expect(trashEmailButton).toBeInTheDocument();
			expect(trashEmailButton).toBeEnabled();
			const editEmailButton = await screen.findByTestId('icon: Edit2Outline');
			expect(editEmailButton).toBeInTheDocument();
			expect(editEmailButton).toBeEnabled();
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

			await user.hover(listItem);
			const sendEmailButton = await screen.findByTestId('icon: EmailOutline');
			expect(sendEmailButton).toBeInTheDocument();
			expect(sendEmailButton).toBeEnabled();
			const moveEmailButton = await screen.findByTestId('icon: MoveOutline');
			expect(moveEmailButton).toBeInTheDocument();
			expect(moveEmailButton).toBeEnabled();
			const trashEmailButton = await screen.findByTestId('icon: Trash2Outline');
			expect(trashEmailButton).toBeInTheDocument();
			expect(trashEmailButton).toBeEnabled();
			const editEmailButton = await screen.findByTestId('icon: Edit2Outline');
			expect(editEmailButton).toBeInTheDocument();
			expect(editEmailButton).toBeEnabled();
		});
	});

	describe('Special characters detection', () => {
		it('should detect special characters in regular keywords', async () => {
			const queryChipWithSpecialChars: QueryChip = {
				hasAvatar: false,
				id: '0',
				label: 'test:keyword',
				value: 'test:keyword'
			};
			const mockedUseQuery = vi.fn().mockReturnValue([[queryChipWithSpecialChars], noop]);
			const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

			const searchViewProps: SearchViewProps = {
				useQuery: mockedUseQuery,
				ResultsHeader: resultsHeader,
				useDisableSearch: (): [boolean, () => void] => [false, noop]
			};

			setupTest(<SearchView {...searchViewProps} />);

			expect(
				await screen.findByText(
					/Special characters like :, ", -, !, etc., are ignored in the search/
				)
			).toBeInTheDocument();
		});

		it('should not detect special characters in advanced search chips from files-ui', async () => {
			const advancedSearchChip = {
				hasAvatar: false,
				id: '0',
				label: 'flagged:true',
				value: 'flagged:true',
				queryChipsToAdvancedFiltersValue: { flagged: true }
			} as QueryChip & { queryChipsToAdvancedFiltersValue: any };
			const mockedUseQuery = vi.fn().mockReturnValue([[advancedSearchChip], noop]);
			const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

			const searchViewProps: SearchViewProps = {
				useQuery: mockedUseQuery,
				ResultsHeader: resultsHeader,
				useDisableSearch: (): [boolean, () => void] => [false, noop]
			};

			setupTest(<SearchView {...searchViewProps} />);

			expect(
				screen.queryByText(/Special characters like :, ", -, !, etc., are ignored in the search/)
			).not.toBeInTheDocument();
		});

		it('should detect special characters in mixed query but exclude advanced search chips', async () => {
			const advancedSearchChip = {
				hasAvatar: false,
				id: '0',
				label: 'flagged:true',
				value: 'flagged:true',
				queryChipsToAdvancedFiltersValue: { flagged: true }
			} as QueryChip & { queryChipsToAdvancedFiltersValue: any };
			const regularKeywordWithSpecialChars: QueryChip = {
				hasAvatar: false,
				id: '1',
				label: 'test:keyword',
				value: 'test:keyword'
			};
			const mixedQuery = [advancedSearchChip, regularKeywordWithSpecialChars];
			const mockedUseQuery = vi.fn().mockReturnValue([mixedQuery, noop]);
			const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

			const searchViewProps: SearchViewProps = {
				useQuery: mockedUseQuery,
				ResultsHeader: resultsHeader,
				useDisableSearch: (): [boolean, () => void] => [false, noop]
			};

			setupTest(<SearchView {...searchViewProps} />);

			expect(
				await screen.findByText(
					/Special characters like :, ", -, !, etc., are ignored in the search/
				)
			).toBeInTheDocument();
		});

		it('should not detect special characters when query contains only advanced search chips', async () => {
			const advancedSearchChip1 = {
				hasAvatar: false,
				id: '0',
				label: 'flagged:true',
				value: 'flagged:true',
				queryChipsToAdvancedFiltersValue: { flagged: true }
			} as QueryChip & { queryChipsToAdvancedFiltersValue: any };
			const advancedSearchChip2 = {
				hasAvatar: false,
				id: '1',
				label: 'shared:true',
				value: 'shared:true',
				queryChipsToAdvancedFiltersValue: { shared: true }
			} as QueryChip & { queryChipsToAdvancedFiltersValue: any };
			const queryWithOnlyAdvancedChips = [advancedSearchChip1, advancedSearchChip2];
			const mockedUseQuery = vi.fn().mockReturnValue([queryWithOnlyAdvancedChips, noop]);
			const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;

			const searchViewProps: SearchViewProps = {
				useQuery: mockedUseQuery,
				ResultsHeader: resultsHeader,
				useDisableSearch: (): [boolean, () => void] => [false, noop]
			};

			setupTest(<SearchView {...searchViewProps} />);

			expect(
				screen.queryByText(/Special characters like :, ", -, !, etc., are ignored in the search/)
			).not.toBeInTheDocument();
		});
	});
});
