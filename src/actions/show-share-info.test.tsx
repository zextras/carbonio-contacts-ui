/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { useActionShowShareInfo } from './show-share-info';
import { UIAction } from './types';
import { FOLDER_VIEW } from '../carbonio-ui-commons/constants';
import { generateFolder } from '../carbonio-ui-commons/test/mocks/folders/folders-generator';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TIMERS } from '../constants/tests';

describe('useActionShareInfo', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionShowShareInfo);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'InfoOutline',
				label: "Shared address book's info",
				id: 'show-share-info-action'
			})
		);
	});

	describe('canExecute', () => {
		it('should return false if the address book is not a linked one', () => {
			const addressBook = generateFolder({
				isLink: false,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionShowShareInfo);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeFalsy();
		});

		it('should return true if the address book is a linked one', () => {
			const name = faker.word.noun();
			const folderId = `${faker.number.int({ min: 101 })}`;
			const addressBook = generateFolder({
				name,
				id: folderId,
				isLink: true,
				n: faker.number.int({ min: 1 }),
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionShowShareInfo);
			const action = result.current;
			expect(action.canExecute(addressBook)).toBeTruthy();
		});
	});

	describe('Execute', () => {
		it('should display a modal with a specific title', () => {
			const addressBook = generateFolder({
				isLink: true,
				view: FOLDER_VIEW.contact
			});

			const { result } = setupHook(useActionShowShareInfo);
			const action = result.current;
			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.getByText("Shared address book's info")).toBeVisible();
		});

		it('should not open the modal if the action cannot be executed', () => {
			const addressBook = generateFolder({
				isLink: false,
				view: FOLDER_VIEW.contact
			});
			const { result } = setupHook(useActionShowShareInfo);
			const action = result.current;

			act(() => {
				action.execute(addressBook);
			});

			act(() => {
				jest.advanceTimersByTime(TIMERS.modal.delayOpen);
			});

			expect(screen.queryByText("Shared address book's info")).not.toBeInTheDocument();
		});
	});
});
