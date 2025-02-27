/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { within } from '@testing-library/react';
import { Button, useTheme } from '@zextras/carbonio-design-system';
import * as shell from '@zextras/carbonio-shell-ui';

import { useRunSearchIntegration } from '../../../../carbonio-ui-commons/integrations/search/use-run-search';
import { useFolderStore } from '../../../../carbonio-ui-commons/store/zustand/folder';
import { useTagStore } from '../../../../carbonio-ui-commons/store/zustand/tags';
import { useAppContext } from '../../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { generateFolder } from '../../../../carbonio-ui-commons/test/mocks/folders/folders-generator';
import {
	makeListItemsVisible,
	screen,
	setupHook,
	setupTest
} from '../../../../carbonio-ui-commons/test/test-setup';
import { FOLDERS_DESCRIPTORS, TESTID_SELECTORS } from '../../../../constants/tests';
import { useNavigation } from '../../../../hooks/useNavigation';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../../../tests/msw-handlers/find-contact-groups';
import { createCnItem, createSoapContact } from '../../../../tests/utils';
import { generateStore } from '../../../tests/generators/store';
import { FolderView } from '../folder-view';
import { createContactsApiInterceptor } from './utils';
import { buildContact } from '../../../../tests/model-builder';
import { generateState } from '../../../../tests/state-builder';

jest.mock('../../../../carbonio-ui-commons/integrations/search/use-run-search', () => ({
	useRunSearchIntegration: jest.fn()
}));

function MockedButton(props: { routeTo: string; initialRoute: string }): React.JSX.Element {
	const { navigateTo } = useNavigation();
	return (
		<>
			<Button data-testid={'navigation-to'} onClick={(): void => navigateTo(props.routeTo)} />
			<Button
				data-testid={'navigation-back'}
				onClick={(): void => navigateTo(props.initialRoute)}
			/>

			<FolderView />
		</>
	);
}

function setupFolderView(
	folderId: string,
	navigateTo = `/folder/${folderId}`,
	store = generateStore(),
	initialRoute = `/folder/${folderId}`
): ReturnType<typeof setupTest> {
	return setupTest(<MockedButton routeTo={navigateTo} initialRoute={initialRoute} />, {
		initialEntries: [initialRoute],
		store
	});
}

describe('Contact Group View', () => {
	const folderId = '100';
	const folder = generateFolder({ id: folderId });
	beforeEach(() => {
		useFolderStore.setState({
			folders: { [folder.id]: folder }
		});
	});

	it('should show the empty displayer message as default, when no item in list is selected', async () => {
		const NO_CONTACT_MESSAGE = 'It looks like there are no contacts yet';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([]),
			offset: 0
		});
		setupFolderView('1');

		expect(await screen.findByText(NO_CONTACT_MESSAGE)).toBeVisible();
	});

	it('Clicking on a contact group in the list opens the displayer for that item', async () => {
		const contactGroupName = faker.company.name();
		const contactGroup = createCnItem(contactGroupName, [], '1', folderId);
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup]),
			offset: 0
		});

		const { user } = setupFolderView(folderId);

		await screen.findByText(contactGroupName);
		await user.click(screen.getByText(contactGroupName));
		await screen.findByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.closeDisplayer });
		expect(screen.getAllByText(contactGroupName)).toHaveLength(3);
		expect(screen.getByText('Addresses list')).toBeVisible();
	});

	it('Click on close action closes the displayer', async () => {
		const EMPTY_BOARD_MESSAGE = 'Create a new contact by clicking the “NEW” button.';
		const contactGroupId = '111';
		const contactGroupName = 'My Contact Group';
		const contactGroup = createCnItem(contactGroupName, [], contactGroupId, folderId);
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup]),
			offset: 0
		});
		const { user } = setupFolderView(folderId);

		const listItem = await screen.findByText(contactGroupName);
		await user.click(listItem);

		expect(screen.getByTestId('contact-group-displayer')).toBeVisible();
		const closeButton = screen.getByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.closeDisplayer
		});
		expect(closeButton).toBeVisible();
		expect(closeButton).toBeEnabled();
		await user.click(closeButton);
		expect(screen.queryByTestId('contact-group-displayer')).not.toBeInTheDocument();
		await screen.findByText(EMPTY_BOARD_MESSAGE);
	});

	it('should display list item as active after clicking on it', async () => {
		const contactGroupId = '111';
		const contactGroupName = 'My Contact Group';
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse(
				[
					createCnItem(contactGroupName, [], contactGroupId, folderId),
					...[...Array(2)].map(() => createCnItem())
				],
				false
			),
			offset: 0
		});
		const {
			result: { current: theme }
		} = setupHook(useTheme);
		const activeBackground = `background: ${theme.palette.highlight.focus}`;

		const { user } = setupFolderView(folderId);

		const styledListItem = await screen.findByTestId(`custom-list-item-${contactGroupId}`);
		const listItem = await within(styledListItem).findByText(contactGroupName);
		await user.click(listItem);
		expect(styledListItem).toHaveStyle(activeBackground);
	});

	it('should open the mail board when clicking on send mail action', async () => {
		const openMailComposer = jest.fn();
		const contactGroupId = '1';
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openMailComposer, true]);
		const contactGroupName = faker.company.name();
		const member = faker.internet.email();
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([
				createCnItem(contactGroupName, [member], contactGroupId, folderId)
			]),
			offset: 0
		});
		const { user } = setupFolderView(folderId);

		const listItem = await screen.findByText(contactGroupName);
		await user.click(listItem);
		const displayerActions = await screen.findByTestId('contact-group-displayer-actions');

		const openEmailComposerAction = within(displayerActions).getByTestId('icon: EmailOutline');
		await user.click(openEmailComposerAction);
		expect(openMailComposer).toHaveBeenCalledTimes(1);
		expect(openMailComposer).toHaveBeenCalledWith({
			recipients: [expect.objectContaining({ email: member })]
		});
	});
});

describe('Contacts', () => {
	it('should call search when tag icon is clicked in the displayer', async () => {
		const runSearch = jest.fn();
		(useRunSearchIntegration as jest.Mock).mockReturnValue(runSearch);

		const folder = FOLDERS_DESCRIPTORS.contacts;
		const contact = buildContact({ lastName: faker.string.uuid(), tags: ['1'] });
		useTagStore.setState({ tags: { '1': { id: '1', name: 'testTag' } } });
		const state = generateState({
			contacts: [contact]
		});
		const store = generateStore(state);

		const { user } = setupFolderView(
			folder.id,
			`/folder/${folder.id}`,
			store,
			`/folder/${folder.id}/contacts/${contact.id}`
		);

		const displayer = await screen.findByTestId('displayer');
		expect(displayer).toBeVisible();
		const tagButtonInDisplayer = await within(displayer).findByTestId('TagIconButton');
		await user.click(tagButtonInDisplayer);

		expect(runSearch).toHaveBeenCalledWith(
			[expect.objectContaining({ label: 'tag:testTag', value: 'tag:"testTag"' })],
			'contacts'
		);
	});
});

it('should reload contacts when switching back to initial folder after changing the filter type', async () => {
	useAppContext.mockReturnValue({ count: 0, setCount: jest.fn() });
	const folderId1 = '7';
	const folderId2 = '9';
	const folder1 = generateFolder({ id: folderId1, name: 'folder 1' });
	const folder2 = generateFolder({ id: folderId2, name: 'folder 2' });
	useFolderStore.setState({
		folders: { [folderId1]: folder1, [folderId2]: folder2 }
	});
	const folder1ContactGroupName = faker.company.name();
	const folder1ContactEmail = faker.internet.email();
	const folder1Contact = createSoapContact({ folderId: folderId1, email: folder1ContactEmail });
	const folder1ContactGroup = createCnItem(folder1ContactGroupName, [], '1', folderId1);
	const folder1SearchAllContactsInterceptor = createContactsApiInterceptor({
		items: [folder1ContactGroup, folder1Contact]
	});

	const { user } = setupFolderView(folderId1, `/folder/${folderId2}`);

	await folder1SearchAllContactsInterceptor;

	expect(await screen.findByText(folder1ContactGroupName)).toBeVisible();
	makeListItemsVisible();
	expect(screen.getByText(folder1ContactEmail)).toBeVisible();
	const folder2ContactEmail = faker.internet.email();
	const folder2ContactGroupName = faker.company.name();
	const folder2Contact = createSoapContact({ folderId: folderId2, email: folder2ContactEmail });
	const folder2ContactGroup = createCnItem(folder2ContactGroupName, [], '1', folderId1);
	const folder2SearchAllContactsInterceptor = createContactsApiInterceptor({
		items: [folder2Contact, folder2ContactGroup]
	});
	await user.click(screen.getByTestId('navigation-to'));
	await folder2SearchAllContactsInterceptor;

	expect(await screen.findByText(folder2ContactGroupName)).toBeVisible();
	makeListItemsVisible();
	expect(screen.getByText(folder2ContactEmail)).toBeVisible();
	expect(screen.queryByText(folder1ContactEmail)).not.toBeInTheDocument();

	const selectContactsViewDropdown = await screen.findByTestId('icon: ChevronDownOutline');
	await user.click(selectContactsViewDropdown);
	const folder2SearchOnlyGroupsInterceptor = createContactsApiInterceptor({
		items: [folder2ContactGroup]
	});
	await user.click(await screen.findByText('Contact Groups'));
	await folder2SearchOnlyGroupsInterceptor;

	expect(await screen.findByText(folder2ContactGroupName)).toBeVisible();
	makeListItemsVisible();
	expect(screen.queryByText(folder2ContactEmail)).not.toBeInTheDocument();
	const folder1SearchOnlyGroupsInterceptor = createContactsApiInterceptor({
		items: [folder1ContactGroup]
	});
	await user.click(screen.getByTestId('navigation-back'));
	await folder1SearchOnlyGroupsInterceptor;

	expect(await screen.findByText(folder1ContactGroupName)).toBeVisible();
	makeListItemsVisible();
	expect(screen.queryByText(folder1ContactEmail)).not.toBeInTheDocument();
	expect(screen.queryByText(folder2ContactGroupName)).not.toBeInTheDocument();
});
