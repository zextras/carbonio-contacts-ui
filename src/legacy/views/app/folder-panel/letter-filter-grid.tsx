/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import styled from '@emotion/styled';
import { Container, Icon, Row, Text, getColor } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ALPHABET, OTHER_INITIAL } from 'legacy/utils/contact-initial';

const SelectableRow = styled(Row)<{ $selected: boolean }>`
	border-radius: 0.25rem;
	cursor: pointer;
	background: ${({ theme, $selected }): string =>
		$selected ? getColor('primary', theme) : 'transparent'};

	&:hover {
		background: ${({ theme, $selected }): string =>
			getColor($selected ? 'primary.hover' : 'gray5.hover', theme)};
	}
`;

/*
 * Sizes taken from the design: a 6 column grid of square cells, which lays the
 * 26 letters plus the "#" bucket out as four full rows and a trailing "Y Z #".
 */
const CELL_SIZE = '2.5rem';

const LetterGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(6, ${CELL_SIZE});
	gap: 0.25rem;
`;

const LetterCell = styled.button<{ $selected: boolean }>`
	appearance: none;
	border: none;
	cursor: pointer;
	border-radius: 0.25rem;
	width: ${CELL_SIZE};
	height: ${CELL_SIZE};
	padding: 0;
	font-family: inherit;
	font-size: 0.875rem;
	background: ${({ theme, $selected }): string =>
		$selected ? getColor('primary', theme) : 'transparent'};
	color: ${({ theme, $selected }): string => getColor($selected ? 'gray6' : 'primary', theme)};

	&:hover {
		background: ${({ theme, $selected }): string =>
			getColor($selected ? 'primary.hover' : 'gray5.hover', theme)};
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
			padding={{ vertical: 'small' }}
			height="fit"
			data-testid="letter-filter-grid"
			gap="0.5rem"
		>
			<SelectableRow
				$selected={activeLetter === null}
				mainAlignment="space-between"
				padding={{ vertical: 'small', horizontal: 'medium' }}
				onClick={selectAllLetters}
				data-testid="letter-filter-all"
			>
				<Text size="small" color={activeLetter === null ? 'gray6' : 'primary'} disabled={false}>
					{t('folder_panel.option.all_letters_caption', 'ALL LETTERS')}
				</Text>
				{activeLetter === null && <Icon icon="Checkmark" size="small" color="gray6" />}
			</SelectableRow>
			<LetterGrid>
				{map([...ALPHABET, OTHER_INITIAL], (letter) => (
					<LetterCell
						key={letter}
						type="button"
						$selected={letter === activeLetter}
						onClick={(): void => onSelect(letter)}
						data-testid={`letter-filter-${letter}`}
					>
						{letter}
					</LetterCell>
				))}
			</LetterGrid>
		</Container>
	);
};
