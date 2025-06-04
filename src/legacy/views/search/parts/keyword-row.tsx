/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';

import { Container, ChipInput } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Query } from '../search-types';

export type KeywordState = Query;

type ComponentProps = {
	compProps: {
		otherKeywords: KeywordState;
		setOtherKeywords: (arg: KeywordState) => void;
		query: Query;
	};
};
const KeywordRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { otherKeywords, setOtherKeywords, query } = compProps;
	const [t] = useTranslation();
	const keywordChipOnAdd = useCallback(
		(label: unknown): Query[number] => ({
			label: label as string,
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);
	const onChange = useCallback(
		(keywords: KeywordState) => {
			setOtherKeywords(keywords);
		},
		[setOtherKeywords]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }}>
			<ChipInput
				placeholder={t('label.keyword', 'Keywords')}
				background="gray5"
				value={otherKeywords}
				onChange={onChange}
				onAdd={keywordChipOnAdd}
				defaultValue={query}
				requireUniqueChips
			/>
		</Container>
	);
};
export default KeywordRow;
