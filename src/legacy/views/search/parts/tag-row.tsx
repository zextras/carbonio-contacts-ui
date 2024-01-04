/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';
import { Container, ChipInput } from '@zextras/carbonio-design-system';

import { filter } from 'lodash';
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

type ComponentProps = {
	compProps: {
		tagOptions: Array<any>;
		tag: Array<any>;
		setTag: (arg: any) => void;
	};
};
const TagRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const [t] = useTranslation();
	const { tagOptions, tag, setTag } = compProps;

	const chipOnAdd = useCallback(
		(label, preText, hasAvatar, isGeneric, isQueryFilter, avatarIcon, avatarBackground) => ({
			label: `${preText}:${label}`,
			hasAvatar,
			isGeneric,
			avatarIcon,
			background: 'gray2',
			avatarBackground: avatarBackground || 'gray2',
			isQueryFilter,
			value: `${preText}:"${label}"`
		}),
		[]
	);

	const tagChipOnAdd = useCallback(
		(label: string | unknown): any => {
			const chipBg = filter(tagOptions, { label })[0];
			return chipOnAdd(
				label,
				'tag',
				true,
				false,
				true,
				'Tag',
				ZIMBRA_STANDARD_COLORS[chipBg.color].hex
			);
		},
		[chipOnAdd, tagOptions]
	);

	const tagPlaceholder = useMemo(() => t('label.tag', 'Tag'), [t]);
	const onTagChange = useCallback(
		(chip) => {
			setTag(chip);
		},
		[setTag]
	);
	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<ChipInput
				placeholder={tagPlaceholder}
				background="gray5"
				defaultValue={[]}
				options={tagOptions}
				value={tag}
				onChange={onTagChange}
				onAdd={tagChipOnAdd}
				disableOptions={false}
				disabled
				requireUniqueChips
			/>
		</Container>
	);
};

export default TagRow;
