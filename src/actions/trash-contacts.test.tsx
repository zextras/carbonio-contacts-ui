/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, FOLDERS } from '@zextras/carbonio-shell-ui';
import { act } from 'react-dom/test-utils';

import { useActionTrashContact } from './trash-contacts';
import { UIAction } from './types';
import { createSoapAPIInterceptor } from '../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { populateFoldersStore } from '../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { Contact } from '../legacy/types/contact';
import { buildContact } from '../tests/model-builder';

describe("Trash-contacts' actions", () => {
	it('should return true if the object response is corectally initialized', () => {
		const { result } = setupHook(useActionTrashContact);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Trash2Outline',
				label: 'Delete contacts permanently',
				id: 'trash-contacts-action'
			})
		);
	});
});

describe('canExecute actions', () => {
	it('should return false if canExecute has TRASH as parent', () => {
		populateFoldersStore();
		const cont: Contact[] = [buildContact({ parent: FOLDERS.TRASH })];
		const { result } = setupHook(useActionTrashContact);
		const action = result.current;
		expect(action.canExecute(cont)).toBeFalsy();
	});

	it("should return true if canExecute hasn't a correct parent as prop", () => {
		populateFoldersStore();
		const cont: Contact[] = [buildContact({ parent: FOLDERS.CONTACTS })];
		const { result } = setupHook(useActionTrashContact);
		const action = result.current;
		expect(action.canExecute(cont)).toBeTruthy();
	});
});

describe('execute actions', () => {
	it('returns true if the label has a correct value', async () => {
		populateFoldersStore();
		const { result } = setupHook(useActionTrashContact);
		const action = result.current;
		expect(action.label).toBe('Delete contacts permanently');
	});
});
describe('apiClientactions', () => {
	it('should show a success snackbar after receiving a successful result from the API', async () => {
		createSoapAPIInterceptor('ContactAction');
		populateFoldersStore();
		const arrayContacts: Array<Contact> = [buildContact()];

		const { result } = setupHook(useActionTrashContact);
		const action = result.current;
		act(() => {
			action.execute(arrayContacts);
		});

		expect(await screen.findByText('Contact moved to trash')).toBeVisible();
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction', response);
		const arrayContacts: Array<Contact> = [buildContact({ parent: FOLDERS.CONTACTS })];

		const { result } = setupHook(useActionTrashContact);
		const action = result.current;
		act(() => {
			action.execute(arrayContacts);
		});
		act(() => {
			jest.advanceTimersByTime(2000);
		});

		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it('should call the API to restore the folder position if the user clicks on the "undo" button on the snackbar', async () => {
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact()];

		const { result, user } = setupHook(useActionTrashContact);
		const action = result.current;
		act(() => {
			action.execute(arrayContacts);
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
					id: arrayContacts[0].id,
					op: 'move',
					l: arrayContacts[0].parent
				}
			})
		);
	});

	it('should show an error snackbar after receiving a failure result from the restore API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		populateFoldersStore();
		createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact({ parent: FOLDERS.CONTACTS })];

		const { result, user } = setupHook(useActionTrashContact);
		const action = result.current;
		act(() => {
			action.execute(arrayContacts);
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
