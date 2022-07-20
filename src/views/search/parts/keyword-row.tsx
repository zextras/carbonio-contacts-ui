/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';
import { Container, ChipInput, ChipProps } from '@zextras/carbonio-design-system';
import { Query } from '../search-types';

export type KeywordState = Array<{
	label: string;
	hasAvatar?: boolean;
	value?: string;
	isQueryFilter?: boolean;
	isGeneric?: boolean;
	avatarIcon?: ChipProps['avatarIcon'];
	avatarBackground?: ChipProps['avatarBackground'];
	hasError?: boolean;
	error?: boolean;
}>;

type ComponentProps = {
	compProps: {
		otherKeywords: KeywordState;
		setOtherKeywords: (arg: KeywordState) => void;
		query: Query;
	};
};
const KeywordRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { otherKeywords, setOtherKeywords, query } = compProps;
	const keywordChipOnAdd = useCallback(
		(label) => ({
			label,
			hasAvatar: false,
			isGeneric: true
		}),
		[]
	);
	const onChange = useCallback(
		(keywords) => {
			setOtherKeywords(keywords);
		},
		[setOtherKeywords]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }}>
			<ChipInput
				placeholder="Keyword"
				background="gray5"
				value={otherKeywords}
				onChange={onChange}
				onAdd={keywordChipOnAdd}
				defaultValue={query}
			/>
		</Container>
	);
};
export default KeywordRow;
