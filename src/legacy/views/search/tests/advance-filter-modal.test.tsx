/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import type { TFunction } from 'i18next';

import { getTags } from '../../../../carbonio-ui-commons/store/zustand/tags';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { AdvancedFilterModal, AdvancedFilterModalProps } from '../advance-filter-modal';

jest.mock('../../../../carbonio-ui-commons/store/zustand/tags', () => ({
	getTags: jest.fn()
}));

describe('Advanced filter modal', () => {
	const tMock = ((key: string, _defaultValue?: any) => key) as TFunction<'translation'>;
	const onSearchConfirmMock = jest.fn();
	const firstQueryChip = {
		id: 'query1',
		label: 'testKeyword1',
		value: 'testKeyword1'
	};
	const secondQueryChip = {
		id: 'query2',
		label: 'testKeyword2',
		value: 'testKeyword2'
	};
	const mockedQuery = [firstQueryChip, secondQueryChip];
	const properties: AdvancedFilterModalProps = {
		open: true,
		onClose: jest.fn(),
		t: tMock,
		query: mockedQuery,
		onSearchConfirm: onSearchConfirmMock,
		isSharedFolderIncludedInitialValue: false,
		isSharedFolderIncludedDefault: false
	};
	it('reset filters button should be enabled if query is not empty', async () => {
		setupTest(<AdvancedFilterModal {...properties} />);
		const fieldLabel = screen.getByText(/title\.advanced_filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = await screen.findByRole('button', { name: /action\.reset_filters/i });

		expect(actionButton).toBeEnabled();
	});
	it('reset filters button should be disabled when modal has no query', () => {
		const advancedFilterModalProps: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};
		setupTest(<AdvancedFilterModal {...advancedFilterModalProps} />);
		const fieldLabel = screen.getByText(/title\.advanced_filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = screen.getByRole('button', {
			name: /action\.reset_filters/i
		});
		expect(actionButton).toBeInTheDocument();
		expect(actionButton).toBeDisabled();
	});

	it('should not clear the global query when reset filters button is clicked', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const resetButton = screen.getByRole('button', { name: /action\.reset_filters/i });
		expect(resetButton).toBeEnabled();
		await user.click(resetButton);
		expect(onSearchConfirmMock).not.toHaveBeenCalled();
	});

	it('should clear the internal state when reset filters button is clicked', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		await screen.findAllByTestId('chip');

		const resetButton = screen.getByRole('button', { name: /action\.reset_filters/i });
		await user.click(resetButton);

		await waitFor(() => {
			expect(screen.queryAllByTestId('chip').length).toBe(0);
		});
	});

	it('should display the provided query in keywords field', async () => {
		setupTest(<AdvancedFilterModal {...properties} />);

		const chips = await screen.findAllByTestId('chip');
		// for some reason toHaveValue('') does not work
		// and with eslint toHaveAttribute('value', 'realValue') is replaced with the above
		// eslint-disable-next-line
		expect(chips[0]).toHaveAttribute('value', 'testKeyword1');
		// eslint-disable-next-line
		expect(chips[1]).toHaveAttribute('value', 'testKeyword2');
	});
	it('should run the search with the new keywords', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const keywordsInput = await screen.findByRole('textbox', { name: /keywords/i });
		await user.type(keywordsInput, 'MyNewKeyword');
		await user.tab();
		const searchButton = screen.getByRole('button', { name: /search/i });
		await user.click(searchButton);
		expect(onSearchConfirmMock).toHaveBeenCalledWith({
			includeSharedFolders: false,
			query: [
				expect.objectContaining(firstQueryChip),
				expect.objectContaining(secondQueryChip),
				expect.objectContaining({ label: 'MyNewKeyword' })
			]
		});
	});

	it('should run the search with tags', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		(getTags as jest.Mock).mockImplementation(() => [
			{
				name: 'tag1'
			}
		]);
		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedDefault: false,
			isSharedFolderIncludedInitialValue: false
		};
		const { user } = setupTest(<AdvancedFilterModal {...props} />);

		const tagsInput = await screen.findByRole('textbox', { name: /tags/i });
		await user.type(tagsInput, 'tag1');
		await user.keyboard('[Enter]');
		const searchButton = screen.getByRole('button', { name: /search/i });
		await user.click(searchButton);
		expect(onSearchConfirmMock).toHaveBeenCalledWith({
			includeSharedFolders: false,
			query: [
				expect.objectContaining({
					label: 'tag:tag1',
					avatarBackground: '#000000',
					avatarIcon: 'Tag',
					background: 'gray2',
					hasAvatar: true,
					isGeneric: false,
					isQueryFilter: true,
					value: 'tag:"tag1"'
				})
			]
		});
	});

	it('should restore initial query state when modal is reopened', async () => {
		const onCloseMock = jest.fn();
		const { user, rerender } = setupTest(
			<AdvancedFilterModal {...properties} onClose={onCloseMock} />
		);

		await screen.findAllByTestId('chip');
		const chips = screen.getAllByTestId('chip');
		expect(chips).toHaveLength(2);

		const resetButton = screen.getByRole('button', { name: /action\.reset_filters/i });
		await user.click(resetButton);

		await waitFor(() => {
			expect(screen.queryAllByTestId('chip')).toHaveLength(0);
		});

		rerender(<AdvancedFilterModal {...properties} open={false} onClose={onCloseMock} />);

		rerender(<AdvancedFilterModal {...properties} open />);

		const restoredChips = await screen.findAllByTestId('chip');
		expect(restoredChips).toHaveLength(2);

		// eslint-disable-next-line
		expect(restoredChips[0]).toHaveAttribute('value', 'testKeyword1');
		// eslint-disable-next-line
		expect(restoredChips[1]).toHaveAttribute('value', 'testKeyword2');
	});

	it('should reset shared folder toggle to initial state when modal is closed without search confirmation', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		const onCloseMock = jest.fn();
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: onCloseMock,
			t: tMock,
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};
		const { user, rerender } = setupTest(<AdvancedFilterModal {...properties} />);

		// Initial state check
		const isSharedFolderIncludedToggle = screen.getByTestId('isSharedFolderIncludedToggle');
		expect(isSharedFolderIncludedToggle).toBeInTheDocument();
		expect(screen.getByTestId('icon: ToggleLeftOutline')).toBeInTheDocument();

		// Toggle the shared folder inclusion
		await user.click(isSharedFolderIncludedToggle);
		expect(screen.getByTestId('icon: ToggleRight')).toBeInTheDocument();

		// Close the modal
		rerender(<AdvancedFilterModal {...properties} open={false} />);

		// Reopen the modal
		rerender(<AdvancedFilterModal {...properties} open />);

		// Check if the shared folder inclusion state is reset to default
		await waitFor(() => {
			expect(screen.getByTestId('icon: ToggleLeftOutline')).toBeInTheDocument();
		});
	});
});
