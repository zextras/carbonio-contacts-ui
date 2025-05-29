/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '@zextras/carbonio-ui-commons';


import { screen, setupHook } from '@test-setup';
import {
	DELETE_PERMANENTLY_ACTION_DESCRIPTOR,
	TESTID_SELECTORS,
	TIMERS
} from '../../../constants/tests';
import { Contact } from '../../../legacy/types/contact';
import { buildContact } from '../../../tests/model-builder';
import { useDeleteContacts } from '../use-delete-contacts';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

describe('Delete-contacts', () => {
	describe("Delete-contacts' actions", () => {
		it('should return delete permanently action with correct icon and label', () => {
			const contacts: Contact[] = [buildContact()];
			const { result } = setupHook(() => useDeleteContacts(contacts));
			expect(result.current).toEqual(expect.objectContaining(DELETE_PERMANENTLY_ACTION_DESCRIPTOR));
		});
	});
	it('should open the delete permanently modal on click', async () => {
		populateFoldersStore();
		const contacts: Contact[] = [buildContact({ parent: FOLDERS.TRASH })];
		const { result } = setupHook(() => useDeleteContacts(contacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(screen.getByRole('button', { name: 'Delete Permanently' })).toBeVisible();
	});

	it('should render a modal with a specific title for single contact', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(screen.getByText('Are you sure to permanently delete this contact?')).toBeVisible();
	});

	it('should render a modal with a specific title for multiple contacts', () => {
		const arrayContacts: Array<Contact> = [buildContact(), buildContact()];
		const { result } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(
			screen.getByText('Are you sure to permanently delete the selected contacts?')
		).toBeVisible();
	});

	it('should display a close icon in the modal', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useDeleteContacts(arrayContacts));
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
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
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

	it('should display a specific confirmation text for single contact', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		expect(
			screen.getByText(
				'By permanently deleting this contact you will not be able to recover it anymore, continue?',
				{
					exact: false
				}
			)
		).toBeVisible();
	});

	it('should call the API with the proper parameters if the user clicks on the "Delete Permanently" button', async () => {
		const apiInterceptor = createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await user.click(button);
		await screen.findByText('Contact permanently deleted');
		await expect(apiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: arrayContacts[0].id,
					op: 'delete'
				}
			})
		);
	});

	it('should show a success snackbar after receiving a successful result from the API', async () => {
		createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await user.click(button);
		expect(await screen.findByText('Contact permanently deleted')).toBeVisible();
	});

	it('should close the modal after a successful result from the API', async () => {
		createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await user.click(button);
		expect(await screen.findByText('Contact permanently deleted')).toBeVisible();
		expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('ContactAction', response);
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await user.click(button);
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it("shouldn't close the modal after a failure result from the API", async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('ContactAction', response);
		const arrayContacts: Array<Contact> = [buildContact()];
		const { result, user } = setupHook(() => useDeleteContacts(arrayContacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await user.click(button);
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		expect(screen.getByTestId('modal')).toBeInTheDocument();
	});
});
