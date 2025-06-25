/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback } from 'react';

import { renderHook, act } from '@testing-library/react';
import { ChipItem } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
	useTranslation: jest.fn()
}));

const TRANSLATION_KEY = 'label.keyword';

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
				useCallback((label: string) => {
					const keywordExists = existingKeywords.some(
						(existingKeyword) => existingKeyword.label === label
					);
					if (keywordExists) {
						return undefined;
					}
					return mockChipOnAdd(label, 'keyword', true, false, true, 'Search', 'gray2');
				}, [])
			);

			// Try to add a duplicate keyword
			act(() => {
				const duplicateResult = result.current('keyword1');
				expect(duplicateResult).toBeUndefined();
			});

			// Try to add a new keyword
			act(() => {
				result.current('keyword2');
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
					[] // Remove unnecessary dependency
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
				return useCallback(() => t(TRANSLATION_KEY, 'Keywords'), [t])();
			});

			expect(mockT).toHaveBeenCalledWith(TRANSLATION_KEY, 'Keywords');
			expect(result.current).toBe(TRANSLATION_KEY);
		});
	});
});
