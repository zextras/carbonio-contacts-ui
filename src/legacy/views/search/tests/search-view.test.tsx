/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react';

import type { SearchViewProps, QueryChip } from '@zextras/carbonio-search-ui';
import { AccountSettings } from '@zextras/carbonio-shell-ui';
import * as hooks from '@zextras/carbonio-shell-ui';
import { noop } from 'lodash';

import { FOLDERS } from '../../../../carbonio-ui-commons/constants/folders';
import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { generateSettings } from '../../../../carbonio-ui-commons/test/mocks/settings/settings-generator';
import { populateFoldersStore } from '../../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { CnItem } from '../../../../network/api/types';
import { createSoapContact, createSoapContactGroupV2 } from '../../../../tests/utils';
import { SearchContactsRequest, SearchContactsSoapResponse } from '../../../../types';
import { generateStore } from '../../../tests/generators/store';
import { type SoapContact } from '../../../types/soap';
import SearchView from '../search-view';

const setupSearch = ({ contacts }: { contacts: Array<CnItem> }): SearchViewProps => {
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
	const searchInterceptor = createSoapAPIInterceptor<
		SearchContactsRequest,
		SearchContactsSoapResponse
	>('Search', {
		cn: contacts,
		more: false,
		offset: 0,
		sortBy: 'nameAsc'
	});
	const resultsHeader = (props: { label: string }): ReactElement => <>{props.label}</>;
	return {
		useQuery: (): [QueryChip[], () => void] => [[queryChip], noop],
		ResultsHeader: resultsHeader,
		useDisableSearch: (): [boolean, () => void] => [false, noop]
	};
};
describe('SearchView', () => {
	it('should display render the basic elements of the view API fulfilled', async () => {
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
		const searchViewProps: SearchViewProps = {
			useQuery: (): [QueryChip[], () => void] => [[queryChip], noop],
			ResultsHeader: resultsHeader,
			useDisableSearch: (): [boolean, () => void] => [false, noop]
		};

		const store = generateStore();
		setupTest(<SearchView {...searchViewProps} />, {
			store
		});
		await searchInterceptor;

		expect(await screen.findByText('Results for:')).toBeInTheDocument();
		expect(await screen.findByText(/Advanced filter/i)).toBeInTheDocument();
		expect(
			await screen.findByText('Select one or more results to perform actions or display details.')
		).toBeInTheDocument();
	});

	describe('Contact Groups', () => {
		it('should display the selected contact group in detail panel', async () => {
			populateFoldersStore();
			const soapContactGroup = createSoapContactGroupV2({
				contactGroupName: 'Test Contact Group',
				folderId: FOLDERS.CONTACTS
			});
			const store = generateStore();

			const searchViewProps = setupSearch({ contacts: [soapContactGroup] });
			const { user } = setupTest(<SearchView {...searchViewProps} />, {
				store
			});
			const listItem = await screen.findByText('Test Contact Group');
			await user.click(listItem);

			expect(await screen.findByTestId('contact-group-displayer')).toBeVisible();
		});
	});
});
