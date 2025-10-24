/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';
import { Folder } from '@zextras/carbonio-ui-commons';
import { vi } from 'vitest';

import { screen, setupTest } from '@test-setup';
import { FolderIsContainedInModal } from 'components/modals/folder-is-contained-in';
import { TESTID_SELECTORS } from 'constants/tests';

vi.mock('components/folder-tree-selector/folder-tree-selector', () => ({
	FolderTreeSelector: ({
		onFolderSelected
	}: {
		onFolderSelected: (folder: Folder) => void;
	}): React.JSX.Element => (
		<div data-testid="folder-tree-selector">
			<button
				data-testid="select-folder-button"
				onClick={(): void =>
					onFolderSelected({
						id: 'test-folder-id',
						name: 'Test Folder',
						absFolderPath: '/Test Folder',
						l: '1',
						uuid: 'test-uuid-123',
						view: 'contact',
						rev: 1,
						ms: 1,
						n: 0,
						s: 0,
						i4ms: 1,
						i4next: 1,
						activesyncdisabled: false,
						webOfflineSyncDays: 0,
						perm: 'rwidx',
						recursive: false,
						deletable: true,
						isLink: false,
						children: [],
						parent: undefined,
						depth: 1,
						items: [],
						size: 0
					} as Folder)
				}
			>
				Select Test Folder
			</button>
		</div>
	)
}));

describe('FolderIsContainedInModal', () => {
	const mockOnClose = vi.fn();
	const mockConfirmAction = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should display the modal with correct title', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		expect(screen.getByText('Is contained in')).toBeVisible();
	});

	it('should display a close icon', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		expect(
			screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close })
		).toBeVisible();
	});

	it('should call onClose when close icon is clicked', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const closeButton = screen.getByRoleWithIcon('button', { icon: TESTID_SELECTORS.icons.close });
		await user.click(closeButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('should display the FolderTreeSelector component', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		expect(screen.getByTestId('folder-tree-selector')).toBeVisible();
	});

	it('should have confirm button disabled initially', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		const confirmButton = screen.getByRole('button', { name: 'Choose folder' });
		expect(confirmButton).toBeDisabled();
	});

	it('should enable confirm button when a folder is selected', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const selectFolderButton = screen.getByTestId('select-folder-button');
		await user.click(selectFolderButton);

		await waitFor(() => {
			const confirmButton = screen.getByRole('button', { name: 'Choose folder' });
			expect(confirmButton).toBeEnabled();
		});
	});

	it('should call confirmAction with selected folder when confirm button is clicked', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const selectFolderButton = screen.getByTestId('select-folder-button');
		await user.click(selectFolderButton);

		await waitFor(async () => {
			const confirmButton = screen.getByRole('button', { name: 'Choose folder' });
			expect(confirmButton).toBeEnabled();
			await user.click(confirmButton);
		});

		expect(mockConfirmAction).toHaveBeenCalledTimes(1);
		expect(mockConfirmAction).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'test-folder-id',
				name: 'Test Folder',
				absFolderPath: '/Test Folder'
			}),
			mockOnClose
		);
	});

	it('should display cancel button', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
	});

	it('should call onClose when cancel button is clicked', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const cancelButton = screen.getByRole('button', { name: 'Cancel' });
		await user.click(cancelButton);

		expect(mockOnClose).toHaveBeenCalledTimes(1);
	});

	it('should not call confirmAction when confirm button is clicked without folder selection', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const confirmButton = screen.getByRole('button', { name: 'Choose folder' });

		expect(confirmButton).toBeDisabled();

		expect(mockConfirmAction).not.toHaveBeenCalled();
	});

	it('should pass correct props to FolderTreeSelector', () => {
		setupTest(<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />);

		expect(screen.getByTestId('folder-tree-selector')).toBeVisible();
	});

	it('should update selected folder when different folder is selected', async () => {
		const { user } = setupTest(
			<FolderIsContainedInModal onClose={mockOnClose} confirmAction={mockConfirmAction} />
		);

		const selectFolderButton = screen.getByTestId('select-folder-button');
		await user.click(selectFolderButton);

		await waitFor(() => {
			const confirmButton = screen.getByRole('button', { name: 'Choose folder' });
			expect(confirmButton).toBeEnabled();
		});

		const confirmButton = screen.getByRole('button', { name: 'Choose folder' });
		await user.click(confirmButton);

		expect(mockConfirmAction).toHaveBeenCalledTimes(1);
	});
});
