/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { Grant, JSNS, useFolderStore } from '@zextras/carbonio-ui-commons';
import { vi } from 'vitest';

import { screen, setupTest } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { ShareFolderModal } from 'components/modals/address-book-edit/share-folder-modal';
import { TESTID_SELECTORS } from 'constants/tests';
import { BatchShareFolderResponse } from 'network/api/share-folder';

// Mock ContactInput with a simple input element to avoid complexity of the chip input
vi.mock('legacy/integrations/contact-input', () => ({
	ContactInput: ({
		onChange,
		placeholder,
		inputRef
	}: {
		onChange: (chips: Array<{ value: { email: string }; id: string; label: string }>) => void;
		placeholder?: string;
		inputRef?: React.Ref<HTMLInputElement>;
	}): React.JSX.Element => (
		<input
			ref={inputRef}
			placeholder={placeholder}
			data-testid={'mock-contact-input'}
			onChange={(e): void =>
				onChange([{ value: { email: e.target.value }, id: '1', label: e.target.value }])
			}
		/>
	)
}));

const buildGrant = (overrides: Partial<Grant> = {}): Grant => ({
	perm: 'r',
	gt: 'usr',
	d: 'john.doe@example.com',
	zid: faker.string.uuid(),
	...overrides
});

const buildErrorResponse = (): BatchShareFolderResponse => ({
	Fault: {
		Code: { Value: faker.string.uuid() },
		Detail: { Error: { Code: faker.string.uuid(), Trace: faker.word.preposition() } },
		Reason: { Text: faker.word.sample() }
	},
	_jsns: JSNS.ALL
});

describe('ShareFolderModal', () => {
	const addressBookId = '7';
	const addressBookName = 'My Contacts';

	beforeEach(() => {
		useFolderStore.setState({
			folders: {
				[addressBookId]: generateFolder({
					id: addressBookId,
					name: addressBookName,
					view: 'contact'
				})
			}
		});
	});

	describe('non-edit mode', () => {
		const grant = buildGrant();

		it('should display the title with the address book name', () => {
			setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			expect(screen.getByText(`Share ${addressBookName}`)).toBeVisible();
		});

		it('should display a close icon button', () => {
			setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			expect(
				screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
			).toBeVisible();
		});

		it('should call onClose when the close icon is clicked', async () => {
			const onClose = vi.fn();
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={onClose} activeGrant={grant} />
			);
			await user.click(screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close }));
			expect(onClose).toHaveBeenCalled();
		});

		it('should display the recipients input with required marker in placeholder', () => {
			setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			expect(screen.getByPlaceholderText(/Recipients' e-mail addresses\*/)).toBeVisible();
		});

		it('should have the "Share folder" confirm button disabled when no recipient is added', () => {
			setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			expect(screen.getByRole('button', { name: 'Share folder' })).toBeDisabled();
		});

		it('should enable the "Share folder" button after a recipient is added', async () => {
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			await act(async () =>
				user.type(screen.getByTestId('mock-contact-input'), 'test@example.com')
			);
			expect(screen.getByRole('button', { name: 'Share folder' })).toBeEnabled();
		});

		it('should have the note input enabled when "Send notification" is checked', () => {
			setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			expect(screen.getByRole('textbox', { name: 'Add a note to standard message' })).toBeEnabled();
		});

		it('should call the Batch API with the correct folder id and role on confirm', async () => {
			const apiInterceptor = createSoapAPIInterceptor('Batch');
			const recipientEmail = 'test@example.com';
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			await act(async () => user.type(screen.getByTestId('mock-contact-input'), recipientEmail));
			await act(async () => user.click(screen.getByRole('button', { name: 'Share folder' })));
			expect(apiInterceptor).resolves.toEqual(
				expect.objectContaining({
					FolderActionRequest: expect.arrayContaining([
						expect.objectContaining({
							action: expect.objectContaining({
								id: addressBookId,
								op: 'grant',
								grant: expect.objectContaining({ perm: 'r' })
							})
						})
					])
				})
			);
		});

		it('should display a success snackbar after a successful share', async () => {
			createSoapAPIInterceptor('Batch');
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			await act(async () =>
				user.type(screen.getByTestId('mock-contact-input'), 'test@example.com')
			);
			await act(async () => user.click(screen.getByRole('button', { name: 'Share folder' })));
			expect(await screen.findByText('Address book shared')).toBeVisible();
		});

		it('should close the modal after a successful share', async () => {
			createSoapAPIInterceptor('Batch');
			const onClose = vi.fn();
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={onClose} activeGrant={grant} />
			);
			await act(async () =>
				user.type(screen.getByTestId('mock-contact-input'), 'test@example.com')
			);
			await act(async () => user.click(screen.getByRole('button', { name: 'Share folder' })));
			await waitFor(() => expect(onClose).toHaveBeenCalled());
		});

		it('should display an error snackbar if the API fails', async () => {
			createSoapAPIInterceptor('Batch', buildErrorResponse());
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={vi.fn()} activeGrant={grant} />
			);
			await act(async () =>
				user.type(screen.getByTestId('mock-contact-input'), 'test@example.com')
			);
			await act(async () => user.click(screen.getByRole('button', { name: 'Share folder' })));
			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});

		it('should not close the modal if the API fails', async () => {
			createSoapAPIInterceptor('Batch', buildErrorResponse());
			const onClose = vi.fn();
			const { user } = setupTest(
				<ShareFolderModal addressBookId={addressBookId} onClose={onClose} activeGrant={grant} />
			);
			await act(async () =>
				user.type(screen.getByTestId('mock-contact-input'), 'test@example.com')
			);
			await act(async () => user.click(screen.getByRole('button', { name: 'Share folder' })));
			await screen.findByText('Something went wrong, please try again');
			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('edit mode', () => {
		const editGrant = buildGrant({ perm: 'r', d: 'john.doe@example.com' });

		it('should display the grantee name in the title', () => {
			setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={vi.fn()}
					activeGrant={editGrant}
					editMode
				/>
			);
			// "john doe" is derived from the email by replacing "." with space
			expect(screen.getByText(/Edit.*John Doe.*access/i)).toBeVisible();
		});

		it('should not display the recipients input', () => {
			setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={vi.fn()}
					activeGrant={editGrant}
					editMode
				/>
			);
			expect(screen.queryByTestId('mock-contact-input')).not.toBeInTheDocument();
		});

		it('should display the grantee chip with role info', () => {
			setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={vi.fn()}
					activeGrant={editGrant}
					editMode
				/>
			);
			// GranteeInfo renders a Chip with "{d} - {role}"
			expect(screen.getByText(/john.doe@example.com.*Viewer/i)).toBeVisible();
		});

		it('should have the "Edit access" button disabled when the role is unchanged', () => {
			setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={vi.fn()}
					activeGrant={editGrant}
					editMode
				/>
			);
			expect(screen.getByRole('button', { name: 'Edit access' })).toBeDisabled();
		});

		it('should display a success snackbar after updating access rights', async () => {
			createSoapAPIInterceptor('Batch');
			createSoapAPIInterceptor('SendShareNotification');
			// Use a grant with 'rwidx' (Manager) so selecting a different role enables the button
			const managerGrant = buildGrant({ perm: 'rwidx', d: 'john.doe@example.com' });
			const { user } = setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={vi.fn()}
					activeGrant={managerGrant}
					editMode
				/>
			);
			// Select "Viewer" (different from the current "Manager") to enable the confirm button
			await act(async () => user.click(screen.getByText('Manager')));
			await act(async () => user.click(await screen.findByText('Viewer')));
			await act(async () => user.click(screen.getByRole('button', { name: 'Edit access' })));
			expect(await screen.findByText('Access rights updated')).toBeVisible();
		});

		it('should close the modal after successfully updating access rights', async () => {
			createSoapAPIInterceptor('Batch');
			createSoapAPIInterceptor('SendShareNotification');
			const managerGrant = buildGrant({ perm: 'rwidx', d: 'john.doe@example.com' });
			const onClose = vi.fn();
			const { user } = setupTest(
				<ShareFolderModal
					addressBookId={addressBookId}
					onClose={onClose}
					activeGrant={managerGrant}
					editMode
				/>
			);
			await act(async () => user.click(screen.getByText('Manager')));
			await act(async () => user.click(await screen.findByText('Viewer')));
			await act(async () => user.click(screen.getByRole('button', { name: 'Edit access' })));
			await waitFor(() => expect(onClose).toHaveBeenCalled());
		});
	});
});
