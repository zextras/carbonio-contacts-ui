/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen } from '@testing-library/react';
import type { TFunction } from 'i18next';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import AdvancedFilterModal, { AdvancedFilterModalProps } from '../advance-filter-modal';

describe('Advanced filter modal', () => {
	const tMock = ((key: string, _defaultValue?: any) => key) as TFunction<'translation'>;
	const onSearchConfirmMock = jest.fn();
	const mockedQuery = [
		{
			id: 'query1',
			label: 'keywords',
			value: 'keyword'
		}
	];
	const properties: AdvancedFilterModalProps = {
		open: true,
		onClose: jest.fn(),
		t: tMock,
		query: mockedQuery,
		onSearchConfirm: onSearchConfirmMock,
		isSharedFolderIncluded: false,
		setIsSharedFolderIncluded: jest.fn()
	};
	it('reset filters button should be enabled if query is not empty', async () => {
		setupTest(<AdvancedFilterModal {...properties} />);
		const fieldLabel = screen.getByText(/title\.advanced_filters/i);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = await screen.findByRole('button', { name: /action\.reset_filters/i });

		expect(actionButton).toBeEnabled();
	});
	it('reset filters button should be disable when modal open', () => {
		const properties: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			setIsSharedFolderIncluded: jest.fn(),
			isSharedFolderIncluded: false
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
});
