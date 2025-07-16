/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { getTags } from '@zextras/carbonio-ui-commons';
import type { TFunction } from 'i18next';

import {
	AdvancedFilterModal,
	AdvancedFilterModalProps
} from 'legacy/views/search/advance-filter-modal';
import { setupTest } from '@test-setup';

jest.mock('@zextras/carbonio-ui-commons', () => ({
	...jest.requireActual('@zextras/carbonio-ui-commons'),
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

	it('should filter out advanced search chips from files-ui when switching modules', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		const advancedSearchChip = {
			id: 'advanced1',
			label: 'flagged:true',
			value: 'flagged:true',
			queryChipsToAdvancedFiltersValue: { flagged: true }
		};
		const regularKeywordChip = {
			id: 'keyword1',
			label: 'test keyword',
			value: 'test keyword'
		};
		const tagChip = {
			id: 'tag1',
			label: 'tag:important',
			value: 'tag:"important"',
			isQueryFilter: true
		};
		const queryWithAdvancedChips = [advancedSearchChip, regularKeywordChip, tagChip];

		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: queryWithAdvancedChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const keywordChips = await screen.findAllByTestId('chip');
		const keywordChip = keywordChips.find(chip => chip.getAttribute('value') === 'test keyword');
		expect(keywordChip).toBeInTheDocument();
		
		const advancedChip = keywordChips.find(chip => chip.getAttribute('value') === 'flagged:true');
		expect(advancedChip).toBeUndefined();
	});

	it('should filter out query filter chips from keywords field', async () => {
		const queryFilterChip = {
			id: 'filter1',
			label: 'type:contact',
			value: 'type:contact',
			isQueryFilter: true
		};
		const regularKeywordChip = {
			id: 'keyword1',
			label: 'john doe',
			value: 'john doe'
		};
		const queryWithFilterChips = [queryFilterChip, regularKeywordChip];

		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: queryWithFilterChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const chips = await screen.findAllByTestId('chip');
		expect(chips).toHaveLength(1);
		// eslint-disable-next-line
		expect(chips[0]).toHaveAttribute('value', 'john doe');
	});

	it('should handle mixed query with advanced chips, regular keywords, and tags', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		const advancedSearchChip = {
			id: 'advanced1',
			label: 'shared:true',
			value: 'shared:true',
			queryChipsToAdvancedFiltersValue: { shared: true }
		};
		const regularKeywordChip = {
			id: 'keyword1',
			label: 'john',
			value: 'john'
		};
		const tagChip = {
			id: 'tag1',
			label: 'tag:important',
			value: 'tag:"important"'
		};
		const queryFilterChip = {
			id: 'filter1',
			label: 'folder:inbox',
			value: 'folder:inbox',
			isQueryFilter: true
		};
		const mixedQuery = [advancedSearchChip, regularKeywordChip, tagChip, queryFilterChip];

		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: mixedQuery,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const keywordChips = await screen.findAllByTestId('chip');
		const keywordChip = keywordChips.find(chip => chip.getAttribute('value') === 'john');
		expect(keywordChip).toBeInTheDocument();
		
		const advancedChip = keywordChips.find(chip => chip.getAttribute('value') === 'shared:true');
		const filterChip = keywordChips.find(chip => chip.getAttribute('value') === 'folder:inbox');
		expect(advancedChip).toBeUndefined();
		expect(filterChip).toBeUndefined();
	});

	it('should not show any chips when query contains only advanced search chips', async () => {
		jest.spyOn(console, 'error').mockImplementation();
		const advancedSearchChip1 = {
			id: 'advanced1',
			label: 'flagged:true',
			value: 'flagged:true',
			queryChipsToAdvancedFiltersValue: { flagged: true }
		};
		const advancedSearchChip2 = {
			id: 'advanced2',
			label: 'shared:true',
			value: 'shared:true',
			queryChipsToAdvancedFiltersValue: { shared: true }
		};
		const queryWithOnlyAdvancedChips = [advancedSearchChip1, advancedSearchChip2];

		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: jest.fn(),
			t: tMock,
			query: queryWithOnlyAdvancedChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false,
			isSharedFolderIncludedDefault: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const chips = screen.queryAllByTestId('chip');
		expect(chips).toHaveLength(0);
	});
});
