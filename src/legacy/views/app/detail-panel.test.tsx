/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

import DetailPanel from './detail-panel';
import { getSetupServer } from '../../../carbonio-ui-commons/test/jest-setup';
import { FOLDERS } from '../../../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { populateFoldersStore } from '../../../carbonio-ui-commons/test/mocks/store/folders';
import { screen, setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { JEST_MOCKED_ERROR, TESTID_SELECTORS } from '../../../constants/tests';
import { buildSoapError } from '../../../tests/utils';
import * as modifyContactApi from '../../store/actions/modify-contact';
import { generateStore } from '../../tests/generators/store';
import { State } from '../../types/store';

describe('Detail panel', () => {
	it('should close edit view when save is successful', async () => {
		populateFoldersStore();
		const modifyContactSpy = jest.spyOn(modifyContactApi, 'modifyContact');
		const contactId = faker.string.uuid();
		const folderId = FOLDERS.CONTACTS;
		const oldName = faker.person.firstName();
		const newName = faker.person.firstName();
		const preloadedState: Partial<State> = {
			contacts: {
				contacts: {
					[folderId]: [
						{
							fileAsStr: oldName,
							URL: {},
							address: {},
							company: faker.company.name(),
							department: faker.string.alpha(10),
							email: {},
							firstName: oldName,
							id: contactId,
							image: faker.string.alpha(10),
							jobTitle: faker.person.jobTitle(),
							lastName: faker.person.lastName(),
							middleName: faker.person.middleName(),
							namePrefix: faker.string.alpha(10),
							nameSuffix: faker.string.alpha(10),
							nickName: faker.string.alpha(10),
							notes: faker.string.alpha(10),
							parent: folderId,
							phone: {}
						}
					]
				},
				status: {}
			}
		};
		getSetupServer().use(
			http.post('/service/soap/ModifyContactRequest', async () =>
				HttpResponse.json({
					Body: {
						ModifyContactResponse: {
							cn: [
								{
									d: 1706529220000,
									f: '',
									fileAsStr: oldName,
									i4uid: contactId,
									id: contactId,
									l: folderId,
									meta: [{}],
									rev: 5000,
									t: '',
									tn: '',
									_attrs: { firstName: newName }
								}
							]
						}
					}
				})
			)
		);
		const store = generateStore(preloadedState);
		const { user } = setupTest(<DetailPanel />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			store
		});
		await screen.findByText(/edit/i);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.edit)).toBeVisible();
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(saveButton).toBeDisabled();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		await user.type(inputName, newName);
		expect(saveButton).toBeEnabled();
		await user.click(saveButton);
		expect(modifyContactSpy).toHaveBeenCalled();
		await screen.findByTestId(TESTID_SELECTORS.icons.displayerIcon);
		expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
		expect(
			screen.getByRoleWithIcon('button', { name: /edit/i, icon: TESTID_SELECTORS.icons.edit })
		).toBeVisible();
	});

	// the test doesn't work because the error case is not handled
	it.skip('should leave edit view open when save returns an error', async () => {
		const contactId = faker.string.uuid();
		const folderId = faker.string.uuid();
		const oldName = faker.string.alpha(10);
		const newName = faker.string.alpha(10);
		const preloadedState: Partial<State> = {
			contacts: {
				contacts: {
					[folderId]: [
						{
							fileAsStr: oldName,
							URL: {},
							address: {},
							company: faker.company.name(),
							department: faker.string.alpha(10),
							email: {},
							firstName: oldName,
							id: contactId,
							image: faker.string.alpha(10),
							jobTitle: faker.person.jobTitle(),
							lastName: faker.person.lastName(),
							middleName: faker.person.middleName(),
							namePrefix: faker.string.alpha(10),
							nameSuffix: faker.string.alpha(10),
							nickName: faker.string.alpha(10),
							notes: faker.string.alpha(10),
							parent: folderId,
							phone: {}
						}
					]
				},
				status: {}
			}
		};
		getSetupServer().use(
			http.post('/service/soap/ModifyContactRequest', async () =>
				HttpResponse.json(buildSoapError(JEST_MOCKED_ERROR), { status: 500 })
			)
		);
		const store = generateStore(preloadedState);
		const { user } = setupTest(<DetailPanel />, {
			initialEntries: [`/folder/${folderId}/edit/${contactId}`],
			store
		});
		await screen.findByText(/edit/i);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.edit)).toBeVisible();
		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(saveButton).toBeDisabled();
		const inputName = screen.getByRole('textbox', { name: /first name/i });
		await user.type(inputName, newName);
		expect(saveButton).toBeEnabled();
		await user.click(saveButton);
		expect(screen.getByTestId(TESTID_SELECTORS.icons.edit)).toBeVisible();
		expect(saveButton).toBeVisible();
	});
});
