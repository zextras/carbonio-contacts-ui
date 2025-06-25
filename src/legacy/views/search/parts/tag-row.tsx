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

const tagPrefix = 'tag';

const TagRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const [t] = useTranslation();
	const { tagOptions, tag, setTag } = compProps;

	const tagChipOnAdd = useCallback(
		(label: string): any => {
			const tagLabel = `${tagPrefix}:${label}`;
			const tagExists = tag.some((existingTag) => existingTag.label === tagLabel);
			if (tagExists) {
				return undefined;
			}
			const chipBg = filter(tagOptions, { label })[0];
			return {
				label: tagLabel,
				hasAvatar: true,
				isGeneric: false,
				avatarIcon: 'Tag',
				background: 'gray2',
				isQueryFilter: true,
				value: `${tagPrefix}:"${label}"`,
				avatarBackground: ZIMBRA_STANDARD_COLORS[chipBg.color ?? 0].hex || 'gray2'
			};
		},
		[tagOptions, tag]
	);

	const tagPlaceholder = useMemo(() => t('label.tags', 'Tags'), [t]);
	const onTagChange = useCallback(
		(chips: ChipItem[]) => {
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
