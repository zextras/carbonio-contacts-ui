/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

import { TESTID_SELECTORS, TIMERS } from '../../../constants/tests';
import { Contact } from '../../../legacy/types/contact';
import { ContactActionRequest, ContactActionResponse } from '../../../network/api/contact-action';
import { setupMoveItemModal } from '../../../tests/modal-helpers';
import { buildContact } from '../../../tests/model-builder';
import { useMoveContacts } from '../use-move-contacts';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { makeListItemsVisible, screen, setupHook } from '@test-setup';

function aFailingContactMove(): any {
	const response: ErrorSoapBodyResponse = {
		Fault: {
			Code: { Value: faker.string.uuid() },
			Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
			Reason: { Text: faker.word.sample() }
		}
	};
	return createSoapAPIInterceptor('ContactAction', response);
}

describe('useMoveContacts', () => {
	const contacts: Contact[] = [buildContact()];
	it('should open the move modal on click', async () => {
		populateFoldersStore();
		const { result } = setupHook(() => useMoveContacts(contacts, 'My Modal'));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(screen.getByRole('button', { name: /Move/i })).toBeVisible();
	});

	it('should render a modal with the given title', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useMoveContacts(arrayContacts, 'My Modal'));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(screen.getByText('My Modal')).toBeVisible();
	});

	it('should display a close icon in the modal', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useMoveContacts(arrayContacts, ''));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should close the modal if the user clicks on the close icon', async () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useMoveContacts(arrayContacts, ''));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
	});

	it('should call the API with the proper parameters if the user clicks on the "Move" button', async () => {
		const apiInterceptor = aFailingContactMove();
		const customFolder = generateFolder({
			id: '100'
		});
		const { selectFolder, confirm } = setupMoveItemModal(customFolder);
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useMoveContacts(arrayContacts, ''));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		await selectFolder(user);
		await confirm(user);

		await screen.findByText('Something went wrong, please try again');
		await expect(apiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: arrayContacts[0].id,
					l: customFolder.id,
					op: 'move'
				}
			})
		);
	});

	it('should show a success snackbar and close the modal after receiving a successful result from the API', async () => {
		const { selectFolder, confirm } = setupMoveItemModal();
		const contact = buildContact();
		const contactActionRequestPromise = createSoapAPIInterceptor<
			ContactActionRequest,
			ContactActionResponse
		>('ContactAction', {
			_jsns: 'urn:zimbraMail',
			action: { id: contact.id, op: 'move' },
			requestId: '123'
		});
		const arrayContacts: Array<Contact> = [contact];

		const { result, user } = setupHook(() => useMoveContacts(arrayContacts, ''));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		await selectFolder(user);
		await confirm(user);

		expect(await screen.findByText('Contact moved')).toBeVisible();
		await contactActionRequestPromise;
		expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
	});

	it('should show an error snackbar and leave the modal open after receiving a failure result from the API', async () => {
		aFailingContactMove();
		const { selectFolder, confirm } = setupMoveItemModal();
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useMoveContacts(arrayContacts, ''));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		makeListItemsVisible();
		await selectFolder(user);
		await confirm(user);

		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		expect(screen.getByTestId('modal')).toBeInTheDocument();
	});
});
