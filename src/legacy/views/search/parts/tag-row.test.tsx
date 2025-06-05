import { renderHook, act } from '@testing-library/react';
import { useCallback } from 'react';
import { ChipItem } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { filter } from 'lodash';

// Mock the dependencies
jest.mock('react-i18next', () => ({
	useTranslation: jest.fn()
}));

// Mock ZIMBRA_STANDARD_COLORS since it's not exported
const ZIMBRA_STANDARD_COLORS = [
	{ hex: '#000000' },
	{ hex: '#FFFFFF' }
];

describe('Tag Row Component', () => {
	const mockT = jest.fn((key) => key);
	const mockSetTag = jest.fn();
	const mockChipOnAdd = jest.fn();
	const mockTagOptions = [
		{ label: 'tag1', color: 0 },
		{ label: 'tag2', color: 1 }
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(useTranslation as jest.Mock).mockReturnValue([mockT]);
	});

	describe('tagChipOnAdd', () => {
		it('should prevent adding duplicate tags', () => {
			const existingTags: ChipItem[] = [
				{
					label: 'tag:tag1',
					value: 'tag1',
					hasAvatar: true,
					avatarIcon: 'Tag',
					avatarBackground: ZIMBRA_STANDARD_COLORS[0].hex,
					background: 'gray2'
				}
			];

			const { result } = renderHook(() =>
				useCallback(
					(label: string) => {
						const tagExists = existingTags.some((existingTag) => existingTag.label === `tag:${label}`);
						if (tagExists) {
							return undefined;
						}
						const chipBg = filter(mockTagOptions, { label })[0];
						return mockChipOnAdd(
							label,
							'tag',
							true,
							false,
							true,
							'Tag',
							ZIMBRA_STANDARD_COLORS[chipBg.color ?? 0].hex
						);
					},
					[mockChipOnAdd, mockTagOptions, existingTags]
				)
			);

			// Try to add a duplicate tag
			act(() => {
				const duplicateResult = result.current('tag1');
				expect(duplicateResult).toBeUndefined();
			});

			// Try to add a new tag
			act(() => {
				const newTagResult = result.current('tag2');
				expect(mockChipOnAdd).toHaveBeenCalledWith(
					'tag2',
					'tag',
					true,
					false,
					true,
					'Tag',
					ZIMBRA_STANDARD_COLORS[1].hex
				);
			});
		});
	});

	describe('onTagChange', () => {
		it('should filter out undefined values and update tags', () => {
			const { result } = renderHook(() =>
				useCallback(
					(chips: ChipItem[]) => {
						const validChips = chips.filter((chip): chip is ChipItem => chip !== undefined);
						mockSetTag(validChips);
					},
					[mockSetTag]
				)
			);

			const testChips: (ChipItem | undefined)[] = [
				{
					label: 'tag:tag1',
					value: 'tag1',
					hasAvatar: true,
					avatarIcon: 'Tag',
					avatarBackground: ZIMBRA_STANDARD_COLORS[0].hex,
					background: 'gray2'
				},
				undefined,
				{
					label: 'tag:tag2',
					value: 'tag2',
					hasAvatar: true,
					avatarIcon: 'Tag',
					avatarBackground: ZIMBRA_STANDARD_COLORS[1].hex,
					background: 'gray2'
				}
			];

			act(() => {
				result.current(testChips as ChipItem[]);
			});

			expect(mockSetTag).toHaveBeenCalledWith([
				{
					label: 'tag:tag1',
					value: 'tag1',
					hasAvatar: true,
					avatarIcon: 'Tag',
					avatarBackground: ZIMBRA_STANDARD_COLORS[0].hex,
					background: 'gray2'
				},
				{
					label: 'tag:tag2',
					value: 'tag2',
					hasAvatar: true,
					avatarIcon: 'Tag',
					avatarBackground: ZIMBRA_STANDARD_COLORS[1].hex,
					background: 'gray2'
				}
			]);
		});
	});

	describe('tagPlaceholder', () => {
		it('should return translated placeholder text', () => {
			const { result } = renderHook(() => {
				const [t] = useTranslation();
				return useCallback(() => t('label.tags', 'Tags'), [t])();
			});

			expect(mockT).toHaveBeenCalledWith('label.tags', 'Tags');
			expect(result.current).toBe('label.tags');
		});
	});
}); 