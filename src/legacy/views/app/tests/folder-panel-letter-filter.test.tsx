/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import { useAppContext } from '../../../../../__mocks__/@zextras/carbonio-shell-ui';
import { makeListItemsVisible, screen, setupTest, triggerLoadMore, UserEvent } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';
import { SoapContact } from 'legacy/types/soap';
import { OTHER_INITIAL } from 'legacy/utils/contact-initial';
import { FolderPanelWrapper } from 'legacy/views/app/folder-panel-wrapper';
import { createContactsApiInterceptor } from 'legacy/views/app/tests/utils';
import { SearchContactsSoapRequest, SearchContactsSoapResponse } from 'types';

const FOLDER_ID = '7';

const buildSoapContact = (id: string, attrs: Record<string, string>): SoapContact =>
	({
		id,
		l: FOLDER_ID,
		d: 1700000000000,
		rev: 1,
		fileAsStr:
			attrs.displayName ||
			[attrs.firstName, attrs.lastName].filter(Boolean).join(' ') ||
			attrs.email ||
			'',
		_attrs: attrs
	}) as unknown as SoapContact;

function setupFolderPanel(): ReturnType<typeof setupTest> {
	return setupTest(<FolderPanelWrapper />, {
		initialEntries: [`/folder/${FOLDER_ID}`],
		path: 'folder/:folderId/:type?/:itemId?'
	});
}

async function openSelectContactsView(user: UserEvent): Promise<void> {
	// the dropdown keeps itself open after a selection, so the chevron is clicked
	// only when the menu is actually closed
	if (screen.queryByTestId('icon: ChevronUpOutline')) {
		return;
	}
	await user.click(await screen.findByTestId('icon: ChevronDownOutline'));
}

async function openLetterGrid(user: UserEvent, entryLabel = 'All letters'): Promise<void> {
	await openSelectContactsView(user);
	// the nested dropdown holding the letter grid opens on hover
	await user.hover(await screen.findByText(entryLabel));
	await screen.findByTestId('letter-filter-grid');
}

describe('Folder panel letter filter', () => {
	beforeEach(() => {
		useAppContext.mockReturnValue({ count: 0, setCount: vi.fn() });
		populateFoldersStore();
	});

	it('should search with the cursor bounds of the selected letter', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const letterInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		const request = await letterInterceptor;
		expect(request.query?._content).toBe(`inid:"${FOLDER_ID}"`);
		expect(request.sortVal).toBe('b');
		expect(request.endSortVal).toBe('c');
		expect(request.cursor).toEqual({ id: 0, sortVal: 'b', endSortVal: 'c' });
	});

	it('should restrict the query to contacts while keeping the cursor bounds', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openSelectContactsView(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(await screen.findByText('Contacts'));

		await openLetterGrid(user);
		const letterInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		const request = await letterInterceptor;
		expect(request.query?._content).toBe(`inid:"${FOLDER_ID}" and not #type:group`);
		expect(request.sortVal).toBe('b');
		expect(request.endSortVal).toBe('c');
	});

	it('should show the active letter inside the filter button', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		expect(screen.getByTestId('select-contacts-view')).toHaveTextContent('');

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		await waitFor(() => expect(screen.getByTestId('select-contacts-view')).toHaveTextContent('B'));
	});

	it('should show a dedicated empty message and clear the filters from it', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-Y'));

		expect(
			await screen.findByText('There are no contacts or contact groups starting with "Y"')
		).toBeVisible();

		const clearInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('clear-all-filters-button'));

		const request = await clearInterceptor;
		expect(request.query?._content).toBe(`inid:"${FOLDER_ID}"`);
		expect(request.sortVal).toBeUndefined();
		expect(request.cursor).toBeUndefined();
		await waitFor(() => expect(screen.getByTestId('select-contacts-view')).toHaveTextContent(''));
	});

	it('should show the contacts-only empty message when the contacts filter is active', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openSelectContactsView(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(await screen.findByText('Contacts'));

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-Y'));

		expect(await screen.findByText('There are no contacts starting with "Y"')).toBeVisible();
	});

	it('should show the contact-groups-only empty message when the contact groups filter is active', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openSelectContactsView(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(await screen.findByText('Contact Groups'));

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-Y'));

		expect(await screen.findByText('There are no contact groups starting with "Y"')).toBeVisible();
	});

	it('should search with the other-initial cursor bounds when the "#" bucket is selected', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const otherInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		const request = await otherInterceptor;
		expect(request.sortVal).toBe('');
		expect(request.endSortVal).toBe('a');
		expect(request.cursor).toEqual({ id: 0, sortVal: '', endSortVal: 'a' });
		await waitFor(() =>
			expect(screen.getByTestId('select-contacts-view')).toHaveTextContent(OTHER_INITIAL)
		);
	});

	it('should show a number/symbol specific empty message for the "#" bucket', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		expect(
			await screen.findByText(
				'There are no contacts or contact groups starting with a number or a symbol'
			)
		).toBeVisible();
		expect(
			screen.queryByText(`There are no contacts or contact groups starting with "${OTHER_INITIAL}"`)
		).not.toBeInTheDocument();
	});

	it('should list the contacts whose name starts with a digit or a symbol under the "#" section', async () => {
		const items = [
			buildSoapContact('1', { displayName: '3M Italia' }),
			buildSoapContact('2', { firstName: '1st', lastName: 'Aid' }),
			buildSoapContact('3', { displayName: '!Zorro' })
		];
		createContactsApiInterceptor({ items });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items });
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		expect(await screen.findByTestId(`contacts-list-section-${OTHER_INITIAL}`)).toHaveTextContent(
			'3 visible contacts'
		);
		expect(screen.queryByTestId('contacts-list-section-A')).not.toBeInTheDocument();
	});

	it('should keep the cursor bounds constant across pages while the offset increments', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const firstPageInterceptor = createSoapAPIInterceptor<
			SearchContactsSoapRequest,
			SearchContactsSoapResponse
		>('Search', {
			sortBy: 'nameAsc',
			offset: 0,
			cn: [buildSoapContact('1', { displayName: 'Anna Rossi' })],
			more: true
		});
		await user.click(screen.getByTestId('letter-filter-A'));
		const firstRequest = await firstPageInterceptor;
		await screen.findByTestId('contacts-list-section-A');
		makeListItemsVisible();

		const secondPageInterceptor = createSoapAPIInterceptor<
			SearchContactsSoapRequest,
			SearchContactsSoapResponse
		>('Search', {
			sortBy: 'nameAsc',
			offset: 100,
			cn: [buildSoapContact('2', { displayName: 'Aldo Bianchi' })],
			more: false
		});
		await screen.findByTestId('list-bottom-element');
		await triggerLoadMore();
		const secondRequest = await secondPageInterceptor;

		expect(firstRequest.offset).toBe(0);
		expect(secondRequest.offset).toBe(100);
		expect(secondRequest.sortVal).toBe(firstRequest.sortVal);
		expect(secondRequest.endSortVal).toBe(firstRequest.endSortVal);
	});

	it('should group the contacts into alphabetical sections with their counts', async () => {
		createContactsApiInterceptor({
			items: [
				buildSoapContact('1', { displayName: 'Alice Tincani', email: 'alice@tincani.com' }),
				buildSoapContact('2', { firstName: 'Barbara', lastName: 'Giacomelli' }),
				buildSoapContact('3', { lastName: 'Brown' }),
				buildSoapContact('4', { email: 'brenda@marshall.com' })
			]
		});
		setupFolderPanel();

		await screen.findByTestId('contacts-list-section-A');
		makeListItemsVisible();

		expect(screen.getByTestId('contacts-list-section-A')).toHaveTextContent('1 visible contact');
		expect(screen.getByTestId('contacts-list-section-B')).toHaveTextContent('3 visible contacts');
		expect(screen.getByTestId('contacts-list-section-C')).toHaveTextContent('0 visible contacts');
	});
});
