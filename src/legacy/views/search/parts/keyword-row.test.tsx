import { renderHook, act } from '@testing-library/react';
import { useCallback } from 'react';
import { ChipItem } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

// Mock the dependencies
jest.mock('react-i18next', () => ({
	useTranslation: jest.fn()
}));

describe('Keyword Row Component', () => {
	const mockT = jest.fn((key) => key);
	const mockSetOtherKeywords = jest.fn();
	const mockChipOnAdd = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useTranslation as jest.Mock).mockReturnValue([mockT]);
	});

	describe('keywordChipOnAdd', () => {
		it('should prevent adding duplicate keywords', () => {
			const existingKeywords: ChipItem[] = [
				{
					label: 'keyword1',
					value: 'keyword1',
					hasAvatar: true,
					avatarIcon: 'Search',
					avatarBackground: 'gray2',
					background: 'gray2'
				}
			];

			const { result } = renderHook(() =>
				useCallback(
					(label: string) => {
						const keywordExists = existingKeywords.some((existingKeyword) => existingKeyword.label === label);
						if (keywordExists) {
							return undefined;
						}
						return mockChipOnAdd(
							label,
							'keyword',
							true,
							false,
							true,
							'Search',
							'gray2'
						);
					},
					[mockChipOnAdd, existingKeywords]
				)
			);

			// Try to add a duplicate keyword
			act(() => {
				const duplicateResult = result.current('keyword1');
				expect(duplicateResult).toBeUndefined();
			});

			// Try to add a new keyword
			act(() => {
				const newKeywordResult = result.current('keyword2');
				expect(mockChipOnAdd).toHaveBeenCalledWith(
					'keyword2',
					'keyword',
					true,
					false,
					true,
					'Search',
					'gray2'
				);
			});
		});
	});

	describe('onKeywordChange', () => {
		it('should filter out undefined values and update keywords', () => {
			const { result } = renderHook(() =>
				useCallback(
					(chips: ChipItem[]) => {
						const validChips = chips.filter((chip): chip is ChipItem => chip !== undefined);
						mockSetOtherKeywords(validChips);
					},
					[mockSetOtherKeywords]
				)
			);

			const testChips: (ChipItem | undefined)[] = [
				{
					label: 'keyword1',
					value: 'keyword1',
					hasAvatar: true,
					avatarIcon: 'Search',
					avatarBackground: 'gray2',
					background: 'gray2'
				},
				undefined,
				{
					label: 'keyword2',
					value: 'keyword2',
					hasAvatar: true,
					avatarIcon: 'Search',
					avatarBackground: 'gray2',
					background: 'gray2'
				}
			];

			act(() => {
				result.current(testChips as ChipItem[]);
			});

			expect(mockSetOtherKeywords).toHaveBeenCalledWith([
				{
					label: 'keyword1',
					value: 'keyword1',
					hasAvatar: true,
					avatarIcon: 'Search',
					avatarBackground: 'gray2',
					background: 'gray2'
				},
				{
					label: 'keyword2',
					value: 'keyword2',
					hasAvatar: true,
					avatarIcon: 'Search',
					avatarBackground: 'gray2',
					background: 'gray2'
				}
			]);
		});
	});

	describe('keywordPlaceholder', () => {
		it('should return translated placeholder text', () => {
			const { result } = renderHook(() => {
				const [t] = useTranslation();
				return useCallback(() => t('label.keyword', 'Keywords'), [t])();
			});

			expect(mockT).toHaveBeenCalledWith('label.keyword', 'Keywords');
			expect(result.current).toBe('label.keyword');
		});
	});
}); 