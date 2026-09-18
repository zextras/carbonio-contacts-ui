/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useAppContext } from '../../../../../__mocks__/@zextras/carbonio-shell-ui';
import { makeListItemsVisible, screen, setupTest, UserEvent } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { SoapContact } from 'legacy/types/soap';
import { DIGITS } from 'legacy/utils/contact-initial';
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

function setupFolderPanel(): ReturnType<typeof setupTest> {
	return setupTest(<FolderPanelWrapper />, {
		initialEntries: [`/folder/${FOLDER_ID}`],
		path: 'folder/:folderId/:type?/:itemId?'
	});
}

async function openLetterGrid(user: UserEvent, entryLabel = 'All letters'): Promise<void> {
	await user.click(await screen.findByTestId('icon: ChevronDownOutline'));
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

		await user.click(await screen.findByTestId('icon: ChevronDownOutline'));
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

	it('should show the active letter next to the filter button', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		expect(screen.queryByTestId('active-letter-filter')).not.toBeInTheDocument();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-B'));

		expect(await screen.findByTestId('active-letter-filter')).toHaveTextContent('B');
	});

	it('should show a dedicated empty message and clear the filters from it', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-Y'));

		expect(await screen.findByText('There are no contacts starting with "Y"')).toBeVisible();

		const clearInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('clear-all-filters-button'));

		const request = await clearInterceptor;
		expect(request.query?._content).toBe(`inid:"${FOLDER_ID}"`);
		expect(screen.queryByTestId('active-letter-filter')).not.toBeInTheDocument();
	});

	it('should search on every digit when the # bucket is selected', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);

		const digitsInterceptor = createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-#'));

		const request = await digitsInterceptor;
		expect(request.query?._content).toBe(
			`inid:"${FOLDER_ID}" and ((not #type:group and ${CONTACT_DIGITS_CLAUSE})` +
				` or (#type:group and ${anyDigit('fullName')}))`
		);
		expect(await screen.findByTestId('active-letter-filter')).toHaveTextContent('#');
	});

	it('should show a number specific empty message for the # bucket', async () => {
		createContactsApiInterceptor({ items: [] });
		const { user } = setupFolderPanel();

		await openLetterGrid(user);
		createContactsApiInterceptor({ items: [] });
		await user.click(screen.getByTestId('letter-filter-#'));

		expect(await screen.findByText('There are no contacts starting with a number')).toBeVisible();
		expect(screen.queryByText(/starting with "#"/)).not.toBeInTheDocument();
	});

	it('should list the contacts whose name starts with a digit under the # section', async () => {
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
		await user.click(screen.getByTestId('letter-filter-#'));

		expect(await screen.findByTestId('contacts-list-section-#')).toHaveTextContent(
			'2 visible contacts'
		);
		expect(screen.queryByTestId('contacts-list-section-A')).not.toBeInTheDocument();
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
