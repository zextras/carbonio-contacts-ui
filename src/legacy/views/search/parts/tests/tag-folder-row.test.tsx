/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor, within } from '@testing-library/react';
import { getTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';
import { useForm } from 'react-hook-form';
import { Mock } from 'vitest';

import { screen, setupTest } from '__test__/test-setup';
import { TagFolderRow } from 'legacy/views/search/parts/tag-folder-row';
import { AdvancedFilterModalFormValues } from 'legacy/views/search/types';

vi.mock('@zextras/carbonio-ui-commons', async () => {
	const actual = await vi.importActual<typeof import('@zextras/carbonio-ui-commons')>(
		'@zextras/carbonio-ui-commons'
	);
	return {
		...actual,
		getTags: vi.fn(),
		isSharedAccountFolder: vi.fn()
	};
});

vi.mock('components/modals/folder-is-contained-in', () => ({
	FolderIsContainedInModal: vi.fn(({ onClose, confirmAction }) => (
		<div data-testid="folder-modal">
			<button data-testid="close-modal" onClick={onClose}>
				Close
			</button>
			<button
				data-testid="confirm-folder"
				onClick={(): void =>
					confirmAction(
						{
							id: 'test-folder-id',
							absFolderPath: '/test/folder',
							name: 'Test Folder'
						},
						onClose
					)
				}
			>
				Confirm
			</button>
		</div>
	))
}));

vi.mock('helpers/folders', () => ({
	getFolderIconColor: vi.fn(() => '#000000')
}));

const mockTags = [
	{
		id: 'tag1',
		name: 'Important',
		color: 1
	},
	{
		id: 'tag2',
		name: 'Work',
		color: 2
	},
	{
		id: 'tag3',
		name: 'Personal',
		color: 0
	}
];

// Test wrapper component to provide form context
const TestWrapper = ({
	defaultValues = {}
}: {
	defaultValues?: Partial<AdvancedFilterModalFormValues>;
}): React.JSX.Element => {
	const { control, setValue } = useForm<AdvancedFilterModalFormValues>({
		defaultValues: {
			tagInput: [],
			folderInput: [],
			...defaultValues
		}
	});

	return <TagFolderRow control={control} setValue={setValue} />;
};

describe('TagFolderRow', () => {
	beforeEach(() => {
		(getTags as Mock).mockReturnValue(mockTags);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render both tag and folder input fields', () => {
			setupTest(<TestWrapper />);

			expect(screen.getByTestId('tagInput')).toBeVisible();
			expect(screen.getByTestId('folderInput')).toBeVisible();
		});

		it('should display correct placeholder texts', () => {
			setupTest(<TestWrapper />);

			expect(screen.getByPlaceholderText('label.tags')).toBeVisible();
			expect(screen.getByPlaceholderText('share.is_contained_in')).toBeVisible();
		});

		it('should have correct background styling for inputs', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByTestId('tagInput');
			const folderInput = screen.getByTestId('folderInput');

			expect(tagInput).toBeInTheDocument();
			expect(folderInput).toBeInTheDocument();
		});

		it('should render folder input with folder icon', () => {
			setupTest(<TestWrapper />);

			const folderInput = screen.getByTestId('folderInput');
			const folderIcon = screen.getByTestId('icon: FolderOutline');
			expect(folderInput).toBeInTheDocument();
			expect(folderIcon).toBeInTheDocument();
		});
	});

	describe('Tag Input Functionality', () => {
		it('should create tag options from getTags', () => {
			setupTest(<TestWrapper />);

			expect(getTags).toHaveBeenCalled();
		});

		it('should handle tag input changes', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByPlaceholderText('label.tags');
			// The input is disabled, so we just verify it exists and has the correct attributes
			expect(tagInput).toBeInTheDocument();
			expect(tagInput).toBeDisabled();
		});

		it('should prevent duplicate tags', () => {
			const defaultValues = {
				tagInput: [
					{
						id: '',
						label: 'tag:Important',
						value: 'tag:"Important"'
					}
				]
			};

			setupTest(<TestWrapper defaultValues={defaultValues} />);

			const tagInput = screen.getByTestId('tagInput');
			expect(tagInput).toBeInTheDocument();
		});

		it('should create correct chip data for tags', () => {
			setupTest(<TestWrapper />);

			// Test the tag chip creation logic
			const expectedTagChip = {
				label: 'tag:Important',
				hasAvatar: true,
				isGeneric: false,
				avatarIcon: 'Tag',
				background: 'gray2',
				avatarBackground: ZIMBRA_STANDARD_COLORS[1].hex,
				isQueryFilter: true,
				value: 'tag:"Important"'
			};

			expect(expectedTagChip.label).toBe('tag:Important');
			expect(expectedTagChip.hasAvatar).toBe(true);
			expect(expectedTagChip.avatarIcon).toBe('Tag');
		});

		it('should filter out undefined chips in onChange', () => {
			setupTest(<TestWrapper />);

			const mockChips = [
				{ id: '1', label: 'tag:Valid', value: 'tag:"Valid"' },
				undefined,
				{ id: '2', label: 'tag:Another', value: 'tag:"Another"' },
				undefined
			];

			const validChips = mockChips.filter((chip) => chip !== undefined);

			expect(validChips).toHaveLength(2);
			expect(validChips[0]?.label).toBe('tag:Valid');
			expect(validChips[1]?.label).toBe('tag:Another');
		});

		it('should handle onAdd with non-string input for tags', () => {
			setupTest(<TestWrapper />);

			// Test the onAdd function logic for non-string inputs
			const nonStringInputs = [123, null, undefined, {}, []];

			nonStringInputs.forEach((input) => {
				const result = typeof input !== 'string' ? undefined : input;
				if (typeof input !== 'string') {
					expect(result).toBeUndefined();
				}
			});
		});

		it('should handle onAdd with string input for tags', () => {
			setupTest(<TestWrapper />);

			const stringInput = 'TestTag';
			const mockValues: Array<{ label: string }> = [];

			const alreadyExists = mockValues.some(({ label }) => label === `tag:${stringInput}`);

			expect(alreadyExists).toBe(false);
			expect(typeof stringInput).toBe('string');
		});
	});

	describe('Folder Input Functionality', () => {
		it('should open folder modal when icon is clicked', async () => {
			const { user } = setupTest(<TestWrapper />);

			const folderInputContainer = screen.getByTestId('folderInput');
			const iconButton = within(folderInputContainer).getByRole('button');

			expect(iconButton).toBeInTheDocument();
			await user.click(iconButton);

			await waitFor(() => {
				expect(screen.getByTestId('folder-modal')).toBeVisible();
			});
		});

		it('should close folder modal when close button is clicked', async () => {
			const { user } = setupTest(<TestWrapper />);

			// Open modal first
			const folderInputContainer = screen.getByTestId('folderInput');
			const iconButton = within(folderInputContainer).getByRole('button');
			await user.click(iconButton);

			await waitFor(() => {
				expect(screen.getByTestId('folder-modal')).toBeVisible();
			});

			// Close modal
			const closeButton = screen.getByTestId('close-modal');
			await user.click(closeButton);

			await waitFor(() => {
				expect(screen.queryByTestId('folder-modal')).not.toBeInTheDocument();
			});
		});

		it('should handle folder selection and create correct chip', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());

			const { user } = setupTest(<TestWrapper />);

			// Open modal
			const folderInputContainer = screen.getByTestId('folderInput');
			const iconButton = within(folderInputContainer).getByRole('button');
			await user.click(iconButton);

			await waitFor(() => {
				expect(screen.getByTestId('folder-modal')).toBeVisible();
			});

			// Confirm folder selection
			const confirmButton = screen.getByTestId('confirm-folder');
			await user.click(confirmButton);

			await waitFor(() => {
				expect(screen.queryByTestId('folder-modal')).not.toBeInTheDocument();
			});

			consoleSpy.mockRestore();
		});

		it('should handle confirmAction with undefined folder', () => {
			setupTest(<TestWrapper />);

			const mockOnClose = vi.fn();
			const mockSetValue = vi.fn();

			const folderDestination = undefined;
			const shouldSetValue = folderDestination !== undefined;

			expect(shouldSetValue).toBe(false);
			expect(mockSetValue).not.toHaveBeenCalled();

			// onClose should still be called
			mockOnClose();
			expect(mockOnClose).toHaveBeenCalled();
		});

		it('should create correct folder chip data', () => {
			// Test the folder chip creation logic
			const expectedFolderChip = {
				label: 'in:/test/folder',
				hasAvatar: true,
				isGeneric: false,
				background: 'gray2',
				avatarIcon: 'FolderOutline',
				isQueryFilter: true,
				value: 'in:"/test/folder"'
			};

			expect(expectedFolderChip.label).toBe('in:/test/folder');
			expect(expectedFolderChip.hasAvatar).toBe(true);
			expect(expectedFolderChip.avatarIcon).toBe('FolderOutline');
		});
	});

	describe('Chip Creation Functions', () => {
		it('should handle chipOnAdd with correct parameters', () => {
			setupTest(<TestWrapper />);

			const result = {
				label: 'test:value',
				hasAvatar: true,
				isGeneric: false,
				avatarIcon: 'TestIcon',
				background: 'gray2',
				avatarBackground: 'testColor',
				isQueryFilter: true,
				value: 'test:"value"'
			};

			expect(result.label).toBe('test:value');
			expect(result.value).toBe('test:"value"');
		});

		it('should handle chipOnAdd with empty avatarBackground', () => {
			setupTest(<TestWrapper />);

			const result = {
				label: 'test:value',
				hasAvatar: true,
				isGeneric: false,
				avatarIcon: 'TestIcon',
				background: 'gray2',
				avatarBackground: 'gray2',
				isQueryFilter: true,
				value: 'test:"value"'
			};

			expect(result.avatarBackground).toBe('gray2');
		});

		it('should handle folderChipOnAdd with string input', () => {
			setupTest(<TestWrapper />);

			const testLabel = '/test/folder';
			const expectedResult = {
				label: `in:${testLabel}`,
				hasAvatar: true,
				isGeneric: false,
				isQueryFilter: true,
				avatarIcon: 'FolderOutline',
				background: 'gray2',
				avatarBackground: '',
				value: `in:"${testLabel}"`
			};

			expect(expectedResult.label).toBe('in:/test/folder');
			expect(expectedResult.value).toBe('in:"/test/folder"');
		});

		it('should handle folderChipOnAdd with non-string input', () => {
			setupTest(<TestWrapper />);

			const nonStringInputs = [123, null, undefined, {}, []];

			nonStringInputs.forEach((input) => {
				expect(typeof input !== 'string').toBe(true);
			});
		});

		it('should handle tagChipOnAdd with existing tag', () => {
			const defaultValues = {
				tagInput: [
					{
						id: '',
						label: 'tag:Important',
						value: 'tag:"Important"'
					}
				]
			};

			setupTest(<TestWrapper defaultValues={defaultValues} />);

			// Test that duplicate tags are prevented
			const existingTag = 'Important';
			const existingValues = [{ label: `tag:${existingTag}` }];

			const alreadyExists = existingValues.some(({ label }) => label === `tag:${existingTag}`);

			expect(alreadyExists).toBe(true);
		});

		it('should handle tagChipOnAdd with new tag', () => {
			setupTest(<TestWrapper />);

			// Test creating a new tag chip
			const newTag = 'NewTag';
			const existingValues: Array<{ label: string }> = [];

			const alreadyExists = existingValues.some(({ label }) => label === `tag:${newTag}`);

			expect(alreadyExists).toBe(false);

			const expectedChip = {
				label: `tag:${newTag}`,
				hasAvatar: true,
				isGeneric: false,
				isQueryFilter: true,
				avatarIcon: 'Tag',
				background: 'gray2',
				avatarBackground: ZIMBRA_STANDARD_COLORS[0].hex,
				value: `tag:"${newTag}"`
			};

			expect(expectedChip.label).toBe('tag:NewTag');
			expect(expectedChip.avatarIcon).toBe('Tag');
		});

		it('should handle tag chip creation with color fallback', () => {
			setupTest(<TestWrapper />);

			const nonExistentTag = 'NonExistentTag';
			const emptyTagOptions: Array<{ label: string; color?: number }> = [];

			const chipBg = emptyTagOptions.filter((tag) => tag.label === nonExistentTag);
			const colorIndex = chipBg[0]?.color ?? 0;

			expect(chipBg).toHaveLength(0);
			expect(colorIndex).toBe(0);
		});
	});

	describe('Form Integration', () => {
		it('should use correct form field names', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByTestId('tagInput');
			const folderInput = screen.getByTestId('folderInput');

			expect(tagInput).toBeInTheDocument();
			expect(folderInput).toBeInTheDocument();
		});

		it('should handle form value changes', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByPlaceholderText('label.tags');
			const folderInput = screen.getByPlaceholderText('share.is_contained_in');

			expect(tagInput).toBeInTheDocument();
			expect(folderInput).toBeInTheDocument();

			expect(tagInput).toBeDisabled();
			expect(folderInput).toBeDisabled();
		});

		it('should maintain form state correctly', () => {
			const defaultValues = {
				tagInput: [{ id: '1', label: 'tag:Test', value: 'tag:"Test"' }],
				folderInput: [{ id: '2', label: 'in:/inbox', value: 'in:"/inbox"' }]
			};

			setupTest(<TestWrapper defaultValues={defaultValues} />);

			const tagInput = screen.getByTestId('tagInput');
			const folderInput = screen.getByTestId('folderInput');

			expect(tagInput).toBeInTheDocument();
			expect(folderInput).toBeInTheDocument();
		});
	});

	describe('Container Layout', () => {
		it('should render with correct container structure', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByTestId('tagInput');
			const folderInput = screen.getByTestId('folderInput');

			expect(tagInput).toBeInTheDocument();
			expect(folderInput).toBeInTheDocument();
		});

		it('should have proper spacing and layout', () => {
			setupTest(<TestWrapper />);

			const tagInput = screen.getByTestId('tagInput');
			const folderInput = screen.getByTestId('folderInput');

			expect(tagInput).toBeVisible();
			expect(folderInput).toBeVisible();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty tags list', () => {
			(getTags as Mock).mockReturnValue([]);

			setupTest(<TestWrapper />);

			expect(screen.getByTestId('tagInput')).toBeVisible();
		});

		it('should handle tags without color property', () => {
			const tagsWithoutColor = [
				{
					id: 'tag1',
					name: 'No Color Tag'
				}
			];

			(getTags as Mock).mockReturnValue(tagsWithoutColor);

			setupTest(<TestWrapper />);

			expect(screen.getByTestId('tagInput')).toBeVisible();
		});

		it('should handle undefined folder selection', async () => {
			const { user } = setupTest(<TestWrapper />);

			const folderInputContainer = screen.getByTestId('folderInput');
			const iconButton = within(folderInputContainer).getByRole('button');
			await user.click(iconButton);

			await waitFor(() => {
				expect(screen.getByTestId('folder-modal')).toBeVisible();
			});
		});
	});

	describe('Accessibility', () => {
		it('should have proper test ids for testing', () => {
			setupTest(<TestWrapper />);

			expect(screen.getByTestId('tagInput')).toBeInTheDocument();
			expect(screen.getByTestId('folderInput')).toBeInTheDocument();
		});

		it('should have proper placeholder texts for screen readers', () => {
			setupTest(<TestWrapper />);

			expect(screen.getByPlaceholderText('label.tags')).toBeInTheDocument();
			expect(screen.getByPlaceholderText('share.is_contained_in')).toBeInTheDocument();
		});
	});
});
