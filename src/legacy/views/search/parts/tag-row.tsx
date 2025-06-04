/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';

import { Container, ChipInput, ChipInputProps, ChipItem } from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';
import { filter } from 'lodash';
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
		(
			label: string,
			preText: string,
			hasAvatar: boolean,
			isGeneric: boolean,
			isQueryFilter: boolean,
			avatarIcon: string,
			avatarBackground: string
		) => ({
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
		(label: string): any => {
			// Check if tag already exists by comparing the base name
			const tagExists = tag.some((existingTag) => existingTag.label === `tag:${label}`);
			if (tagExists) {
				return undefined; // Return undefined to prevent adding duplicate
			}
			const chipBg = filter(tagOptions, { label })[0];
			return chipOnAdd(
				label,
				'tag',
				true,
				false,
				true,
				'Tag',
				ZIMBRA_STANDARD_COLORS[chipBg.color ?? 0].hex
			);
		},
		[chipOnAdd, tagOptions, tag]
	);

	const tagPlaceholder = useMemo(() => t('label.tags', 'Tags'), [t]);
	const onTagChange = useCallback(
		(chips: ChipItem[]) => {
			// Filter out any undefined values that might have been added
			const validChips = chips.filter((chip): chip is ChipItem => chip !== undefined);
			setTag(validChips);
		},
		[setTag]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<ChipInput
				placeholder={tagPlaceholder}
				background="gray5"
				options={tagOptions}
				value={tag}
				onChange={onTagChange as ChipInputProps['onChange']}
				onAdd={tagChipOnAdd as ChipInputProps['onAdd']}
				disableOptions={false}
				requireUniqueChips
			/>
		</Container>
	);
};

export default TagRow;
