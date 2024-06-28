/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

import { ContactsDeleteModal } from './contacts-delete';
import { createSoapAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { screen, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS } from '../../constants/tests';
import { Contact } from '../../legacy/types/contact';
import { buildContact } from '../../tests/model-builder';

describe('ContactsDeleteModal', () => {
	it('should render a modal with a specific title for single contact', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />);
		expect(screen.getByText('Are you sure to permanently delete this contact?')).toBeVisible();
	});

	it('should render a modal with a specific title for multiple contacts', () => {
		const arrayContacts: Array<Contact> = [buildContact(), buildContact()];
		setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />);
		expect(
			screen.getByText('Are you sure to permanently delete the selected contacts?')
		).toBeVisible();
	});

	it('should display a close icon', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />);
		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should close the modal if the user clicks on the close icon', async () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		const onClose = jest.fn();
		const { user } = setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={onClose} />);
		const button = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(button);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should display a confirmation text', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />);
		expect(
			screen.getByText(
				'By permanently deleting this contact you will not be able to recover it anymore, continue?',
				{
					exact: false
				}
			)
		).toBeVisible();
	});

	it('should display a "Delete Permanently" button, enabled', () => {
		const arrayContacts: Array<Contact> = [buildContact()];
		setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		expect(button).toBeEnabled();
	});

	it('should call the API with the proper parameters if the user clicks on the "Delete Permanently" button', async () => {
		const apiInterceptor = createSoapAPIInterceptor('ContactAction');
		const arrayContacts: Array<Contact> = [buildContact()];
		const { user } = setupTest(
			<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await act(() => user.click(button));
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
		const { user } = setupTest(
			<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await act(() => user.click(button));
		expect(await screen.findByText('Contact permanently deleted')).toBeVisible();
	});

	it('should close the modal after a successful result from the API', async () => {
		createSoapAPIInterceptor('ContactAction');
		const onClose = jest.fn();
		const arrayContacts: Array<Contact> = [buildContact()];
		const { user } = setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={onClose} />);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await act(() => user.click(button));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should show an error snackbar after receiving a failure result from the API', async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('ContactAction', response);
		const arrayContacts: Array<Contact> = [buildContact()];
		const { user } = setupTest(
			<ContactsDeleteModal contacts={arrayContacts} onClose={jest.fn()} />
		);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await act(() => user.click(button));
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it("shouldn't close the modal after a failure result from the API", async () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createSoapAPIInterceptor('ContactAction', response);
		const onClose = jest.fn();
		const arrayContacts: Array<Contact> = [buildContact()];
		const { user } = setupTest(<ContactsDeleteModal contacts={arrayContacts} onClose={onClose} />);
		const button = screen.getByRole('button', { name: 'Delete Permanently' });
		await act(() => user.click(button));
		expect(onClose).not.toHaveBeenCalled();
	});
});
