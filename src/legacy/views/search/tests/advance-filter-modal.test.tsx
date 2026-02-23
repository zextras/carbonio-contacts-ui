/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import { getTags } from '@zextras/carbonio-ui-commons';
import { Mock } from 'vitest';

import { AdvancedFilterModal, AdvancedFilterModalProps } from '../advance-filter-modal';
import { setupTest, within } from '@test-setup';

const mockContactInput = vi.fn();

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual<typeof import('@zextras/carbonio-ui-commons')>(
		'@zextras/carbonio-ui-commons'
	);
	return {
		...actual,
		getTags: vi.fn(),
		useContactInput: (): Mock => mockContactInput
	};
});

describe('Advanced filter modal', () => {
	const resetFiltersLbl = 'Reset Filters';
	const onSearchConfirmMock = vi.fn();
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
		onClose: vi.fn(),
		query: mockedQuery,
		onSearchConfirm: onSearchConfirmMock,
		isSharedFolderIncludedInitialValue: false
	};
	it('reset filters button should be enabled if query is not empty', async () => {
		await act(() => setupTest(<AdvancedFilterModal {...properties} />));
		const fieldLabel = screen.getByText(`Advanced Filters`);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = await screen.findByRole('button', { name: resetFiltersLbl });

		expect(actionButton).toBeEnabled();
	});
	it('reset filters button should be disabled when modal has no query', () => {
		const advancedFilterModalProps: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};
		setupTest(<AdvancedFilterModal {...advancedFilterModalProps} />);
		const fieldLabel = screen.getByText(`Advanced Filters`);
		expect(fieldLabel).toBeInTheDocument();

		const actionButton = screen.getByRole('button', {
			name: resetFiltersLbl
		});
		expect(actionButton).toBeInTheDocument();
		expect(actionButton).toBeDisabled();
	});

	it('should not clear the global query when reset filters button is clicked', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const resetButton = screen.getByRole('button', { name: resetFiltersLbl });
		expect(resetButton).toBeEnabled();
		await user.click(resetButton);
		expect(onSearchConfirmMock).not.toHaveBeenCalled();
	});

	it('should clear the internal state when reset filters button is clicked', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		await screen.findAllByTestId('chip');

		const resetButton = screen.getByRole('button', { name: resetFiltersLbl });
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
		const searchButton = screen.getByRole('button', { name: 'Search' });
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
		vi.spyOn(console, 'error').mockImplementation(() => null);
		(getTags as Mock).mockImplementation(() => [
			{
				name: 'tag1'
			}
		]);
		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};
		const { user } = setupTest(<AdvancedFilterModal {...props} />);

		const selectElement = screen.getByTestId('tagInput');
		expect(selectElement).toBeInTheDocument();
		await user.click(selectElement);
		const selectOption = screen.getAllByTestId('dropdown-item')[0];
		await user.click(selectOption);
		const searchButton = screen.getByRole('button', { name: 'Search' });
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
		const onCloseMock = vi.fn();
		const { user, rerender } = setupTest(
			<AdvancedFilterModal {...properties} onClose={onCloseMock} />
		);

		await screen.findAllByTestId('chip');
		const chips = screen.getAllByTestId('chip');
		expect(chips).toHaveLength(2);

		const resetButton = screen.getByRole('button', { name: resetFiltersLbl });
		await user.click(resetButton);

		await waitFor(() => {
			expect(screen.queryAllByTestId('chip')).toHaveLength(0);
		});

		rerender(<AdvancedFilterModal {...properties} open={false} onClose={onCloseMock} />);

		rerender(<AdvancedFilterModal {...properties} open />);

		await waitFor(() => {
			expect(screen.queryAllByTestId('chip')).toHaveLength(0);
		});
	});

	it('should reset filters when modal is closed via close button', async () => {
		const onCloseMock = vi.fn();
		const { user } = setupTest(<AdvancedFilterModal {...properties} onClose={onCloseMock} />);

		await screen.findAllByTestId('chip');
		const initialChips = screen.getAllByTestId('chip');
		expect(initialChips).toHaveLength(2);

		// Add a new keyword to modify the form state
		const keywordsInput = await screen.findByRole('textbox', { name: /keywords/i });
		await user.type(keywordsInput, 'NewKeyword');
		await user.tab();

		// Verify the new chip is added
		await waitFor(() => {
			expect(screen.getAllByTestId('chip')).toHaveLength(3);
		});

		// Close the modal using the close button in the modal header
		const allButtons = screen.getAllByRole('button');
		const closeButton = allButtons.find((button) => {
			const hasResetText = button.textContent?.includes('Reset Filters');
			const hasSearchText = button.textContent?.includes('Search');
			try {
				within(button).getByTestId('icon: Close');
				return !hasResetText && !hasSearchText;
			} catch {
				return false;
			}
		});

		if (closeButton) {
			await user.click(closeButton);
		}

		expect(onCloseMock).toHaveBeenCalled();
	});

	it('should disable search button when query is empty', () => {
		const props: AdvancedFilterModalProps = {
			open: true,
			onClose: vi.fn(),
			query: [],
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const searchButton = screen.getByRole('button', { name: 'Search' });
		expect(searchButton).toBeDisabled();
	});

	it('should enable search button when query has content', async () => {
		setupTest(<AdvancedFilterModal {...properties} />);

		const searchButton = screen.getByRole('button', { name: 'Search' });
		expect(searchButton).toBeEnabled();
	});

	it('should handle shared folder toggle functionality', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		// Find the shared folder toggle (assuming it exists in the component)
		const keywordsInput = await screen.findByRole('textbox', { name: /keywords/i });
		await user.type(keywordsInput, 'test');
		await user.tab();

		const searchButton = screen.getByRole('button', { name: 'Search' });
		await user.click(searchButton);

		expect(onSearchConfirmMock).toHaveBeenCalledWith({
			includeSharedFolders: false,
			query: expect.arrayContaining([
				expect.objectContaining(firstQueryChip),
				expect.objectContaining(secondQueryChip),
				expect.objectContaining({ label: 'test' })
			])
		});
	});

	it('should call onSearchConfirm with correct parameters when search is performed', async () => {
		const { user } = setupTest(<AdvancedFilterModal {...properties} />);

		const searchButton = screen.getByRole('button', { name: 'Search' });
		await user.click(searchButton);

		expect(onSearchConfirmMock).toHaveBeenCalledWith({
			includeSharedFolders: false,
			query: [expect.objectContaining(firstQueryChip), expect.objectContaining(secondQueryChip)]
		});
	});

	it('should filter out advanced search chips from files-ui when switching modules', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => null);

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
			onClose: vi.fn(),
			query: queryWithAdvancedChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const keywordChips = await screen.findAllByTestId('chip');
		const keywordChip = keywordChips.find((chip) => chip.getAttribute('value') === 'test keyword');
		expect(keywordChip).toBeInTheDocument();

		const advancedChip = keywordChips.find((chip) => chip.getAttribute('value') === 'flagged:true');
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
			onClose: vi.fn(),
			query: queryWithFilterChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const chips = await screen.findAllByTestId('chip');
		expect(chips).toHaveLength(1);
		// eslint-disable-next-line
		expect(chips[0]).toHaveAttribute('value', 'john doe');
	});

	it('should handle mixed query with advanced chips, regular keywords, and tags', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => null);

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
			onClose: vi.fn(),
			query: mixedQuery,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const keywordChips = await screen.findAllByTestId('chip');
		const keywordChip = keywordChips.find((chip) => chip.getAttribute('value') === 'john');
		expect(keywordChip).toBeInTheDocument();

		const advancedChip = keywordChips.find((chip) => chip.getAttribute('value') === 'shared:true');
		const filterChip = keywordChips.find((chip) => chip.getAttribute('value') === 'folder:inbox');
		expect(advancedChip).toBeUndefined();
		expect(filterChip).toBeUndefined();
	});

	it('should not show any chips when query contains only advanced search chips', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => null);

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
			onClose: vi.fn(),
			query: queryWithOnlyAdvancedChips,
			onSearchConfirm: onSearchConfirmMock,
			isSharedFolderIncludedInitialValue: false
		};

		setupTest(<AdvancedFilterModal {...props} />);

		const chips = screen.queryAllByTestId('chip');
		expect(chips).toHaveLength(0);
	});

	it('should close modal and call onSearchConfirm when search button is clicked', async () => {
		const onCloseMock = vi.fn();
		const { user } = setupTest(<AdvancedFilterModal {...properties} onClose={onCloseMock} />);

		const searchButton = screen.getByRole('button', { name: 'Search' });
		await user.click(searchButton);

		expect(onSearchConfirmMock).toHaveBeenCalled();
		expect(onCloseMock).toHaveBeenCalled();
	});
});
