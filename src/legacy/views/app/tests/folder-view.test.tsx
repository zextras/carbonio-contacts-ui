/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor, within } from '@testing-library/react';
import { Button, useTheme } from '@zextras/carbonio-design-system';
import * as shell from '@zextras/carbonio-shell-ui';
import {
	FOLDER_VIEW,
	FOLDERS,
	useRunSearchIntegration,
	useFolderStore,
	useTagStore,
	JSNS
} from '@zextras/carbonio-ui-commons';
import { useNavigate } from 'react-router-dom';

import { FOLDERS_DESCRIPTORS, TESTID_SELECTORS } from 'constants/tests';
import { ContactActionRequest, ContactActionResponse } from 'network/api/contact-action';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from 'tests/msw-handlers/find-contact-groups';
import { createSoapContactGroup, createSoapContact, createSoapContactGroupV2 } from 'tests/utils';
import { FolderView } from 'legacy/views/app/folder-view';
import { createContactsApiInterceptor, findContactInList } from 'legacy/views/app/tests/utils';
import { generateLinkFolder } from 'views/contact-groups/tests/utils';
import { makeListItemsVisible, screen, setupHook, setupTest } from '@test-setup';
import { useAppContext } from '@test-utils/carbonio-shell-ui/carbonio-shell-ui';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

jest.mock('@zextras/carbonio-ui-commons', () => ({
	...jest.requireActual('@zextras/carbonio-ui-commons'),
	useRunSearchIntegration: jest.fn()
}));

function MockedButton(props: { routeTo: string; initialRoute: string }): React.JSX.Element {
	const navigate = useNavigate();
	return (
		<>
			<Button data-testid={'navigation-to'} onClick={(): void => navigate(props.routeTo)} />
			<Button data-testid={'navigation-back'} onClick={(): void => navigate(props.initialRoute)} />

			<FolderView />
		</>
	);
}

function setupFolderView(
	folderId: string,
	navigateTo = `/folder/${folderId}`,
	initialRoute = `/folder/${folderId}`
): ReturnType<typeof setupTest> {
	return setupTest(<MockedButton routeTo={navigateTo} initialRoute={initialRoute} />, {
		initialEntries: [initialRoute]
	});
}

function setupFolderViewV2({
	folderId,
	navigateTo = `/folder/${folderId}`,
	initialRoute = `/folder/${folderId}`
}: {
	folderId: string;
	navigateTo?: string;
	initialRoute?: string;
}): ReturnType<typeof setupTest> {
	return setupFolderView(folderId, navigateTo, initialRoute);
}

describe('folder-view', () => {
	describe('Contact Groups', () => {
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
			setupFolderView(folderId);

			expect(await screen.findByText(NO_CONTACT_MESSAGE)).toBeVisible();
		});

		it('Clicking on a contact group in the list opens the displayer for that item', async () => {
			const contactGroupName = faker.company.name();
			const contactGroup = createSoapContactGroup(contactGroupName, [], '1', folderId);
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
			const contactGroup = createSoapContactGroup(contactGroupName, [], contactGroupId, folderId);
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
		});

		it('should display list item as active after clicking on it', async () => {
			const contactGroupId = '111';
			const contactGroupName = 'My Contact Group';
			registerFindContactGroupsHandler({
				findContactGroupsResponse: createFindContactGroupsResponse(
					[
						createSoapContactGroup(contactGroupName, [], contactGroupId, folderId),
						...[...Array(2)].map(() => createSoapContactGroup())
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
					createSoapContactGroup(contactGroupName, [member], contactGroupId, folderId)
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
		describe('in a shared account folder', () => {
			it('should be visible', async () => {
				const remoteAccountUuId = faker.string.uuid();
				const remoteFolderId = '789';
				const folderId = `${remoteAccountUuId}:${remoteFolderId}`;
				const sharedFolder = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId
				});
				useFolderStore.setState({
					folders: { [folderId]: sharedFolder }
				});
				const contactEmail = 'contactofSharedAccount@test.com';
				const contact = createSoapContact({
					id: `${remoteAccountUuId}:1`,
					folderId,
					email: contactEmail
				});
				const searchContacts = createContactsApiInterceptor({
					items: [contact]
				});

				setupFolderView(folderId);

				await findContactInList(contact);
				expect(screen.getByText(contactEmail)).toBeVisible();
			});
		});
		describe('in a folder shared with me', () => {
			it('should be visible', async () => {
				const folderId = '100';
				const remoteAccountUuId = faker.string.uuid();
				const remoteFolderId = '789';
				const sharedFolder = generateLinkFolder({
					folderId,
					remoteAccountUuId,
					remoteId: remoteFolderId
				});
				useFolderStore.setState({
					folders: { [folderId]: sharedFolder }
				});
				const contactEmail = 'contactInSharedFolder@test.com';
				const contact = createSoapContact({
					id: `${remoteAccountUuId}:1`,
					folderId: `${remoteAccountUuId}:${remoteFolderId}`,
					email: contactEmail
				});
				const searchContacts = createContactsApiInterceptor({
					items: [contact]
				});

				setupFolderView(folderId);

				await findContactInList(contact);
				expect(screen.getByText(contactEmail)).toBeVisible();
			});
		});

		describe('in Contacts folder', () => {
			const folder = FOLDERS_DESCRIPTORS.contacts;
			const email = 'test@test.com';
			const contact = createSoapContact({ id: '10', folderId: folder.id, email });
			beforeEach(() => {
				populateFoldersStore();
				const searchInContactsFolderInterceptor = createContactsApiInterceptor({
					items: [contact],
					more: false
				});
			});
			it('should delete a contact (move to trash)', async () => {
				populateFoldersStore();

				const deleteContactInterceptor = createSoapAPIInterceptor<
					ContactActionRequest,
					ContactActionResponse
				>('ContactAction', {
					_jsns: JSNS.MAIL,
					requestId: '123-456',
					action: {
						id: contact.id,
						op: 'delete'
					}
				});
				const { user } = setupFolderView(
					folder.id,
					`/folder/${folder.id}`,
					`/folder/${folder.id}/contacts/${contact.id}`
				);

				await findContactInList(contact);

				const displayer = await screen.findByTestId('contact-displayer');
				expect(displayer).toBeVisible();
				const deleteContactInDisplayer = await within(displayer).findByTestId(
					TESTID_SELECTORS.icons.trash
				);
				await act(() => user.click(deleteContactInDisplayer));
				const deleteContactRequest = await deleteContactInterceptor;
				expect(deleteContactRequest).toEqual({
					_jsns: JSNS.MAIL,
					action: {
						id: contact.id,
						op: 'trash'
					}
				});
			});

			it('should call contactsMoveAction when move action is confirmed (displayer)', async () => {
				const anotherFolder = generateFolder({
					parent: FOLDERS.USER_ROOT,
					name: 'anotherContactFolder',
					id: '500',
					absFolderPath: '/anotherContactFolder',
					view: FOLDER_VIEW.contact,
					children: []
				});
				populateFoldersStore({
					customFolders: [anotherFolder]
				});

				const { user } = setupFolderView(
					folder.id,
					`/folder/${folder.id}`,
					`/folder/${folder.id}/contacts/${contact.id}`
				);

				await findContactInList(contact);
				const displayer = await screen.findByTestId('contact-displayer');
				expect(displayer).toBeVisible();
				const moveButtonInDisplayer = await within(displayer).findByTestId('icon: MoveOutline');
				await act(() => user.click(moveButtonInDisplayer));

				act(() => {
					jest.advanceTimersByTime(1000);
				});

				const modal = screen.getByTestId('modal');
				expect(modal).toBeVisible();
				makeListItemsVisible();
				await user.click(screen.getByTestId(`folder-accordion-item-${anotherFolder.id}`));

				const contactActionRequestPromise = createSoapAPIInterceptor<
					ContactActionRequest,
					ContactActionResponse
				>('ContactAction', {
					_jsns: JSNS.MAIL,
					action: { id: contact.id, op: 'move' },
					requestId: '123'
				});

				const moveButton = within(modal).getByRole('button', { name: /move/i });
				expect(moveButton).toBeEnabled();
				await act(() => user.click(moveButton));

				const contactActionRequest = await contactActionRequestPromise;
				expect(contactActionRequest).toEqual({
					_jsns: JSNS.MAIL,
					action: {
						id: contact.id,
						op: 'move',
						l: anotherFolder.id
					}
				});
			});

			it('should call SendMailAction when Mail icon is clicked in the displayer', async () => {
				const mailTo = { id: 'mail-to', label: 'action.send_msg', execute: jest.fn() };
				jest.spyOn(shell, 'getAction').mockReturnValueOnce([mailTo, true]);

				const { user } = setupFolderView(
					folder.id,
					`/folder/${folder.id}`,
					`/folder/${folder.id}/contacts/${contact.id}`
				);

				await findContactInList(contact);

				const displayer = await screen.findByTestId('contact-displayer');
				expect(displayer).toBeVisible();
				const mailButtonInDisplayer = await within(displayer).findByTestId('icon: MailModOutline');
				await act(() => user.click(mailButtonInDisplayer));

				expect(mailTo.execute).toHaveBeenCalledWith(
					expect.objectContaining({
						id: contact.id
					})
				);
			});

			it('should call search when tag icon is clicked in the displayer', async () => {
				const runSearch = jest.fn();
				(useRunSearchIntegration as jest.Mock).mockReturnValue(runSearch);

				const soapContact = createSoapContact({ t: '1', tn: '1', folderId: folder.id });
				const firstSearchInterceptor = createContactsApiInterceptor({
					items: [soapContact],
					more: false
				});
				useTagStore.setState({ tags: { '1': { id: '1', name: 'testTag' } } });

				const { user } = setupFolderView(
					folder.id,
					`/folder/${folder.id}`,
					`/folder/${folder.id}/contacts/${soapContact.id}`
				);

				await findContactInList(soapContact);

				const displayer = await screen.findByTestId('contact-displayer');
				expect(displayer).toBeVisible();
				const tagButtonInDisplayer = await within(displayer).findByTestId('TagIconButton');
				await user.click(tagButtonInDisplayer);

				expect(runSearch).toHaveBeenCalledWith(
					[expect.objectContaining({ label: 'tag:testTag', value: 'tag:"testTag"' })],
					'contacts'
				);
			});

			it('should call search when selecting a tag icon inside multitag icon button is clicked in the displayer', async () => {
				const runSearch = jest.fn();
				(useRunSearchIntegration as jest.Mock).mockReturnValue(runSearch);
				const soapContact = createSoapContact({ t: '1,2', tn: '1,2', folderId: folder.id });
				const firstSearchInterceptor = createContactsApiInterceptor({
					items: [soapContact],
					more: false
				});

				useTagStore.setState({
					tags: { '1': { id: '1', name: 'testTag1' }, '2': { id: '2', name: 'testTag2' } }
				});

				const { user } = setupFolderView(
					folder.id,
					`/folder/${folder.id}`,
					`/folder/${folder.id}/contacts/${soapContact.id}`
				);

				await findContactInList(soapContact);
				const displayer = await screen.findByTestId('contact-displayer');
				expect(displayer).toBeVisible();
				const tagButtonInDisplayer = await within(displayer).findByTestId('TagIconButton');
				await user.click(tagButtonInDisplayer);

				const tagsDropdown = await screen.findByTestId('dropdown-popper-list');

				const testTag1 = within(tagsDropdown).getByText('testTag1');
				await user.click(testTag1);
				expect(runSearch).toHaveBeenCalledWith(
					[expect.objectContaining({ label: 'tag:testTag1', value: 'tag:"testTag1"' })],
					'contacts'
				);

				await user.click(tagButtonInDisplayer);
				const tagsDropdown2 = await screen.findByTestId('dropdown-popper-list');

				const testTag2 = within(tagsDropdown2).getByText('testTag2');
				await user.click(testTag2);
				expect(runSearch).toHaveBeenCalledWith(
					[expect.objectContaining({ label: 'tag:testTag2', value: 'tag:"testTag2"' })],
					'contacts'
				);
			});
		});
	});

	it('should reload contacts when switching back to initial folder after changing the filter type', async () => {
		useAppContext.mockReturnValue({ count: 0, setCount: jest.fn() });

		const folderId1 = FOLDERS.CONTACTS;
		const folderId2 = FOLDERS.TRASH;
		const folder1 = generateFolder({ id: folderId1, name: 'folder 1' });
		const folder2 = generateFolder({ id: folderId2, name: 'folder 2' });
		useFolderStore.setState({
			folders: { [folderId1]: folder1, [folderId2]: folder2 }
		});
		const folder1ContactGroupName = 'group-in-folder1@test.com';
		const folder1ContactEmail = 'contact-in-folder1@test.com';
		const folder1Contact = createSoapContact({ folderId: folderId1, email: folder1ContactEmail });
		const folder1ContactGroup = createSoapContactGroup(folder1ContactGroupName, [], '1', folderId1);
		const searchContactsInFolder1 = createContactsApiInterceptor({
			items: [folder1ContactGroup, folder1Contact]
		});

		const { user } = setupFolderViewV2({ folderId: folderId1, navigateTo: `/folder/${folderId2}` });

		await searchContactsInFolder1;

		expect(await screen.findByText(folder1ContactGroupName)).toBeVisible();
		makeListItemsVisible();
		expect(screen.getByText(folder1ContactEmail)).toBeVisible();

		const folder2ContactEmail = 'contact-in-folder2@test.com';
		const folder2ContactGroupName = 'group-in-folder2@test.com';
		const folder2Contact = createSoapContact({ folderId: folderId2, email: folder2ContactEmail });
		const folder2ContactGroup = createSoapContactGroupV2({
			contactGroupName: folder2ContactGroupName,
			id: '1',
			folderId: folderId2
		});
		const folder2SearchAllContactsInterceptor = createContactsApiInterceptor({
			items: [folder2Contact, folder2ContactGroup]
		});
		const navigateToFolder2 = screen.getByTestId('navigation-to');
		await user.click(navigateToFolder2);
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
		await waitFor(() => {
			expect(screen.queryByText(folder2ContactEmail)).not.toBeInTheDocument();
		});

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
});
