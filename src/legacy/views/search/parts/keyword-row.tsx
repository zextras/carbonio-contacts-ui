/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Container, ChipInput, ChipInputProps } from '@zextras/carbonio-design-system';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormValuesControlProps } from 'legacy/views/search/types';

type KeywordRowProps = FormValuesControlProps & {
	inputRef?: ChipInputProps['inputRef'];
};

export const KeywordRow = ({ control, inputRef }: KeywordRowProps): ReactElement => {
	const [t] = useTranslation();
	const keywordChipOnAdd = useCallback(
		(label: unknown) => ({
			label: label as string,
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Controller
				control={control}
				name={'keywordInput'}
				render={({ field: { onChange, value } }): React.JSX.Element => (
					<ChipInput
						placeholder={t('advancedFilters.keywords', 'Keywords')}
						data-testid={'keywords-input'}
						background="gray5"
						value={value}
						separators={[
							{ key: 'Enter', ctrlKey: false },
							{ key: ',', ctrlKey: false }
						]}
						onChange={onChange}
						onAdd={keywordChipOnAdd}
						requireUniqueChips
						inputRef={inputRef}
					/>
				)}
			/>
		</Container>
	);
};
