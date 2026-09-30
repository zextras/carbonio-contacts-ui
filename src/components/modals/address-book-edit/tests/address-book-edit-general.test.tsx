/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useFolderStore, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

import { AddressBookEditGeneralModal } from '../address-book-edit-general';
import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { TESTID_SELECTORS } from 'constants/tests';
import { FolderActionRequest } from 'network/api/folder-action';
import { BatchUpdateFolderRequest } from 'network/api/update-folder';

const ADDRESS_BOOK_ID = '1001';
const ADDRESS_BOOK_NAME = 'My Contacts';
const EDIT_LABEL = /^edit$/i;

const setAddressBook = (overrides: { color?: number; rgb?: string } = {}): void => {
	useFolderStore.setState({
		folders: {
			[ADDRESS_BOOK_ID]: {
				...generateFolder({ id: ADDRESS_BOOK_ID, name: ADDRESS_BOOK_NAME, view: 'contact' }),
				...overrides
			}
		}
	});
};

const renderModal = (onClose = vi.fn()): ReturnType<typeof setupTest> =>
	setupTest(
		<AddressBookEditGeneralModal
			addressBookId={ADDRESS_BOOK_ID}
			onClose={onClose}
			onAddShare={vi.fn()}
			onEditShare={vi.fn()}
			onRevokeShare={vi.fn()}
		/>
	);

const getCustomizeTrigger = (): HTMLElement =>
	screen.getByRoleWithIcon('button', { icon: 'icon: PlusCircleOutline' });

describe('AddressBookEditGeneralModal', () => {
	it('should render an empty modal title when the address book does not exist', () => {
		setupTest(
			<AddressBookEditGeneralModal
				addressBookId="non-existing-id"
				onClose={vi.fn()}
				onAddShare={vi.fn()}
				onEditShare={vi.fn()}
				onRevokeShare={vi.fn()}
			/>
		);

		const modalTitle = screen.getByText(/Edit 's properties/i);
		expect(modalTitle).toBeVisible();
	});

	describe('color', () => {
		it('should preselect the standard color of the address book', () => {
			setAddressBook({ color: 3 });
			renderModal();

			expect(
				screen.getByRole('button', { name: ZIMBRA_STANDARD_COLORS[3].zLabel })
			).toHaveAttribute('aria-pressed', 'true');
			expect(
				screen.getByText('Choose a color to make this address book easier to recognize')
			).toBeVisible();
		});

		it('should preselect the custom rgb color of the address book', () => {
			setAddressBook({ color: 3, rgb: '#abcdef' });
			renderModal();

			expect(screen.getByRole('button', { name: /custom color \(#abcdef\)/i })).toHaveAttribute(
				'aria-pressed',
				'true'
			);
		});

		it('should keep the confirm button disabled until the color or the name change', async () => {
			setAddressBook({ color: 1 });
			const { user } = renderModal();

			expect(screen.getByRole('button', { name: EDIT_LABEL })).toBeDisabled();
			await user.click(screen.getByRole('button', { name: ZIMBRA_STANDARD_COLORS[5].zLabel }));
			expect(screen.getByRole('button', { name: EDIT_LABEL })).toBeEnabled();
		});

		it('should batch the update with a separate color action for the picked color', async () => {
			setAddressBook({ color: 1 });
			const { user } = renderModal();
			const interceptor = createSoapAPIInterceptor<BatchUpdateFolderRequest>('Batch');

			await user.click(screen.getByRole('button', { name: ZIMBRA_STANDARD_COLORS[5].zLabel }));
			await user.click(screen.getByRole('button', { name: EDIT_LABEL }));

			const { FolderActionRequest } = await interceptor;
			const [update, colorAction] = FolderActionRequest.map(({ action }) => action);
			expect(update).toEqual(expect.objectContaining({ id: ADDRESS_BOOK_ID, op: 'update' }));
			expect(update).not.toHaveProperty('rgb');
			expect(update).not.toHaveProperty('color');
			expect(colorAction).toEqual({
				id: ADDRESS_BOOK_ID,
				op: 'color',
				rgb: ZIMBRA_STANDARD_COLORS[5].hex
			});
		});

		it('should not send the color when only the name changes', async () => {
			setAddressBook({ color: 1 });
			const { user } = renderModal();
			const interceptor = createSoapAPIInterceptor<FolderActionRequest>('FolderAction');

			await user.type(screen.getByRole('textbox', { name: /representative name/i }), ' renamed');
			await user.click(screen.getByRole('button', { name: EDIT_LABEL }));

			const { action } = await interceptor;
			expect(action.name).toBe(`${ADDRESS_BOOK_NAME} renamed`);
			expect(action).not.toHaveProperty('rgb');
		});

		it('should disable the other controls while the color picker is open', async () => {
			setAddressBook();
			const { user } = renderModal();

			await user.click(getCustomizeTrigger());

			expect(screen.getByRole('textbox', { name: /representative name/i })).toBeDisabled();
			expect(screen.getByRole('button', { name: EDIT_LABEL })).toBeDisabled();
			expect(screen.getByRole('button', { name: /add share/i })).toBeDisabled();
		});

		it('should not close the modal from the header while the color picker is open', async () => {
			setAddressBook();
			const onClose = vi.fn();
			const { user } = renderModal(onClose);

			await user.click(getCustomizeTrigger());
			await user.click(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close }));
			expect(onClose).not.toHaveBeenCalled();

			// The first click only dismissed the picker; with it closed the header closes the modal.
			await user.click(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close }));
			expect(onClose).toHaveBeenCalled();
		});
	});
});
