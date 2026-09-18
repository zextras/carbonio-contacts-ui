/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Row, Text, Tooltip, getColor } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ALPHABET, OTHER_INITIAL } from 'legacy/utils/contact-initial';

const SelectableRow = styled(Row)<{ $selected: boolean }>`
	cursor: pointer;
	background: ${({ theme, $selected }): string =>
		$selected ? getColor('highlight', theme) : 'transparent'};

	&:hover {
		background: ${({ theme }): string => getColor('gray5', theme)};
	}
`;

const LetterGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 0.25rem;
	padding: 0.5rem;
`;

const LetterCell = styled.button<{ $selected: boolean }>`
	appearance: none;
	border: none;
	cursor: pointer;
	border-radius: 0.125rem;
	padding: 0.375rem 0;
	font-family: inherit;
	font-size: 0.875rem;
	background: ${({ theme, $selected }): string =>
		$selected ? getColor('primary', theme) : 'transparent'};
	color: ${({ theme, $selected }): string => getColor($selected ? 'gray6' : 'primary', theme)};

	&:hover {
		background: ${({ theme, $selected }): string =>
			getColor($selected ? 'primary' : 'gray5', theme)};
	}
`;

export type LetterFilterGridProps = {
	activeLetter: string | null;
	onSelect: (letter: string | null) => void;
};

export const LetterFilterGrid = ({
	activeLetter,
	onSelect
}: LetterFilterGridProps): React.JSX.Element => {
	const [t] = useTranslation();

	const selectAllLetters = useCallback(() => onSelect(null), [onSelect]);

	return (
		<Container
			orientation="vertical"
			crossAlignment="stretch"
			mainAlignment="flex-start"
			height="fit"
			data-testid="letter-filter-grid"
		>
			<SelectableRow
				$selected={activeLetter === null}
				mainAlignment="space-between"
				padding={{ vertical: 'small', horizontal: 'medium' }}
				onClick={selectAllLetters}
				data-testid="letter-filter-all"
			>
				<Text size="small" weight="bold" color={activeLetter === null ? 'primary' : 'secondary'}>
					{t('folder_panel.option.all_letters_caption', 'ALL LETTERS')}
				</Text>
				{activeLetter === null && <Icon icon="Checkmark" size="small" color="primary" />}
			</SelectableRow>
			<LetterGrid>
				{map([...ALPHABET, OTHER_INITIAL], (letter) => (
					<Tooltip
						key={letter}
						label={
							letter === OTHER_INITIAL
								? t('folder_panel.option.digits_tooltip', 'Names starting with a number')
								: letter
						}
						disabled={letter !== OTHER_INITIAL}
					>
						<LetterCell
							type="button"
							$selected={letter === activeLetter}
							onClick={(): void => onSelect(letter)}
							data-testid={`letter-filter-${letter}`}
						>
							{letter}
						</LetterCell>
					</Tooltip>
				))}
			</LetterGrid>
		</Container>
	);
};
