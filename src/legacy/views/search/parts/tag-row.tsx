/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';

import { Container, ChipInput, ChipInputProps } from '@zextras/carbonio-design-system';
import { filter } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_STANDARD_COLORS } from '../../../../carbonio-ui-commons/constants/utils';
import { ContactInputItem } from '../../../types/integrations';

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
		(chip: ContactInputItem) => {
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
				onChange={onTagChange as ChipInputProps['onChange']}
				onAdd={tagChipOnAdd as ChipInputProps['onAdd']}
				disableOptions={false}
				disabled
				requireUniqueChips
			/>
		</Container>
	);
};

export default TagRow;
