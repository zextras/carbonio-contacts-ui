/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { createSoapAPIInterceptor } from '@zextras/carbonio-ui-commons';
import { populateFoldersStore } from '@zextras/carbonio-ui-commons';
import { screen, setupHook } from '@zextras/carbonio-ui-commons';
import { TRASH_ACTION } from '../../../constants/actions';
import { Contact } from '../../../legacy/types/contact';
import { buildContact } from '../../../tests/model-builder';
import { useTrashContacts } from '../use-trash-contacts';

describe('useTrashContacts', () => {
	it('should return trash label and icon when action is correctly initialized', () => {
		const contacts: Array<Contact> = [buildContact()];
		const { result } = setupHook(() => useTrashContacts(contacts));
		expect(result.current).toEqual(
			expect.objectContaining({
				icon: TRASH_ACTION.ICON,
				label: 'Delete',
				id: TRASH_ACTION.ID
			})
		);
	});
});

describe('execute actions', () => {
	it('returns true if the label has a correct value', async () => {
		populateFoldersStore();
		const { result } = setupHook(useTrashContacts);
		const action = result.current;
		expect(action.label).toBe('Delete');
	});
});
describe('Api Client Actions', () => {
	it('should show a success snackbar after receiving a successful result from the API', async () => {
		createSoapAPIInterceptor('ContactAction');
		populateFoldersStore();
		const contacts: Array<Contact> = [buildContact()];

		const { result } = setupHook(() => useTrashContacts(contacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});

		expect(await screen.findByText('Contact moved to trash')).toBeVisible();
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction', response);
		const contacts: Array<Contact> = [buildContact({ parent: FOLDERS.CONTACTS })];

		const { result, user } = setupHook(() => useTrashContacts(contacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(2000);
		});

		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it('should call the API to restore the folder position if the user clicks on the "undo" button on the snackbar', async () => {
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction');
		const contacts: Array<Contact> = [buildContact()];

		const { result, user } = setupHook(() => useTrashContacts(contacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(2000);
		});
		const button = await screen.findByRole('button', { name: 'Undo' });

		const restoreApiInterceptor = createSoapAPIInterceptor('ContactAction');
		await act(() => user.click(button));
		await expect(restoreApiInterceptor).resolves.toEqual(
			expect.objectContaining({
				action: {
					id: contacts[0].id,
					op: 'move',
					l: contacts[0].parent
				}
			})
		);
	});

	it('should show an error snackbar after receiving a failure result from the restore API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Code: { Value: faker.string.uuid() },
				Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction');
		const contacts: Array<Contact> = [buildContact({ parent: FOLDERS.CONTACTS })];

		const { result, user } = setupHook(() => useTrashContacts(contacts));
		const action = result.current;
		act(() => {
			action.onClick();
		});
		act(() => {
			jest.advanceTimersByTime(2000);
		});
		const button = await screen.findByRole('button', { name: 'Undo' });

		createSoapAPIInterceptor('ContactAction', response);
		await act(() => user.click(button));
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});
});
