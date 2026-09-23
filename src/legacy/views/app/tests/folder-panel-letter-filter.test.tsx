/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { useAppContext } from '../../../../../__mocks__/@zextras/carbonio-shell-ui';
import { getSetupServer } from '@jest-setup';
import { makeListItemsVisible, screen, setupTest, UserEvent } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { SoapContact } from 'legacy/types/soap';
import { DIGITS, OTHER_INITIAL } from 'legacy/utils/contact-initial';
import { FolderPanelWrapper } from 'legacy/views/app/folder-panel-wrapper';
import { createContactsApiInterceptor } from 'legacy/views/app/tests/utils';

const FOLDER_ID = '7';

const CONTACT_B_CLAUSE =
	'(#displayName:B* or (#displayName:"" and ' +
	'(#firstName:B* or (#firstName:"" and ' +
	'(#lastName:B* or (#lastName:"" and #email:B*))))))';

const anyDigit = (field: string): string =>
	`(${DIGITS.map((digit) => `#${field}:${digit}*`).join(' or ')})`;

const CONTACT_DIGITS_CLAUSE =
	`(${anyDigit('displayName')} or (#displayName:"" and ` +
	`(${anyDigit('firstName')} or (#firstName:"" and ` +
	`(${anyDigit('lastName')} or (#lastName:"" and ${anyDigit('email')}))))))`;

const buildSoapContact = (id: string, attrs: Record<string, string>): SoapContact =>
	({
		id,
		l: FOLDER_ID,
		d: 1700000000000,
		rev: 1,
		fileAsStr: attrs.displayName ?? attrs.firstName ?? attrs.email ?? '',
		_attrs: attrs
	}) as unknown as SoapContact;

const buildSoapGroup = (id: string, fullName: string): SoapContact =>
	({
		id,
		l: FOLDER_ID,
		d: 1700000000000,
		rev: 1,
		fileAsStr: fullName,
		_attrs: { type: 'group', fullName }
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

	it('should search with the display name cascade clause when a letter is selected', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const letterInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		const request = await letterInterceptor;
		expect(request.query?._content).toBe(
			`inid:"${FOLDER_ID}" and ((not #type:group and ${CONTACT_B_CLAUSE})` +
				' or (#type:group and #fullName:B*))'
		);
	});

	it('should restrict the clause to contacts when the contacts filter is active', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openSelectContactsView(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(await screen.findByText('Contacts'));

		await openLetterGrid(user);
		const letterInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		const request = await letterInterceptor;
		expect(request.query?._content).toBe(
			`inid:"${FOLDER_ID}" and not #type:group and ${CONTACT_B_CLAUSE}`
		);
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

	it('should search on every digit when the digits bucket is selected', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const digitsInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		const request = await digitsInterceptor;
		expect(request.query?._content).toBe(
			`inid:"${FOLDER_ID}" and ((not #type:group and ${CONTACT_DIGITS_CLAUSE})` +
				` or (#type:group and ${anyDigit('fullName')}))`
		);
		await waitFor(() =>
			expect(screen.getByTestId('select-contacts-view')).toHaveTextContent(OTHER_INITIAL)
		);
	});

	it('should show a number specific empty message for the digits bucket', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		expect(
			await screen.findByText('There are no contacts or contact groups starting with a number')
		).toBeVisible();
		expect(
			screen.queryByText(`There are no contacts or contact groups starting with "${OTHER_INITIAL}"`)
		).not.toBeInTheDocument();
	});

	it('should list the contacts whose name starts with a digit under the digits section', async () => {
		createContactsApiInterceptor({
			items: [
				buildSoapContact('1', { displayName: '3M Italia' }),
				buildSoapContact('2', { firstName: '1st', lastName: 'Aid' })
			]
		});
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({
			items: [
				buildSoapContact('1', { displayName: '3M Italia' }),
				buildSoapContact('2', { firstName: '1st', lastName: 'Aid' })
			]
		});
		await user.click(screen.getByTestId(`letter-filter-${OTHER_INITIAL}`));

		expect(await screen.findByTestId(`contacts-list-section-${OTHER_INITIAL}`)).toHaveTextContent(
			'2 visible contacts'
		);
		expect(screen.queryByTestId('contacts-list-section-A')).not.toBeInTheDocument();
	});

	it('should not show nor count the items the server matched on a secondary token', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		// the server matches every token of fullName, so this group comes back for the
		// letter A although the list groups it under G
		createContactsApiInterceptor({ items: [buildSoapGroup('1', 'Gruppo Amici')] });
		await user.click(screen.getByTestId('letter-filter-A'));

		expect(
			await screen.findByText('There are no contacts or contact groups starting with "A"')
		).toBeVisible();
		expect(screen.getByTestId('BreadcrumbCount')).toHaveTextContent('0');
	});

	it('should load the next page when every item of a page is filtered out', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const offsets: Array<number> = [];
		getSetupServer().use(
			http.post('/service/soap/SearchRequest', async ({ request }) => {
				const content = (await request.json()) as {
					Body: { SearchRequest: { offset: number } };
				};
				const { offset } = content.Body.SearchRequest;
				offsets.push(offset);
				const isFirstPage = offsets.length === 1;
				return HttpResponse.json({
					Body: {
						SearchResponse: {
							sortBy: 'nameAsc',
							offset,
							more: isFirstPage,
							cn: isFirstPage
								? [buildSoapGroup('1', 'Gruppo Amici')]
								: [buildSoapContact('2', { displayName: 'Anna Rossi' })]
						}
					}
				});
			})
		);
		await user.click(screen.getByTestId('letter-filter-A'));

		expect(await screen.findByTestId('contacts-list-section-A')).toHaveTextContent(
			'1 visible contact'
		);
		await waitFor(() => expect(offsets).toEqual([0, 100]));
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
