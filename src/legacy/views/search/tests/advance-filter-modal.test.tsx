/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import type { TFunction } from 'i18next';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { AdvancedFilterModal, AdvancedFilterModalProps } from '../advance-filter-modal';

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
		isSharedFolderIncludedInitialValue: false
	};
	it('reset filters button should be enabled if query is not empty', async () => {
		setupTest(<AdvancedFilterModal {...properties} />);
		const fieldLabel = screen.getByText(/title\.advanced_filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = await screen.findByRole('button', { name: /action\.reset_filters/i });

		expect(actionButton).toBeEnabled();
	});
	it('reset filters button should be disabled when modal has no query', () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};
		setupTest(<AdvancedFilterModal {...properties} />);
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
});
