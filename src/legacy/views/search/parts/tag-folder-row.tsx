/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import {
	ChipInput,
	ChipInputProps,
	Container,
	CustomModal,
	Icon,
	Padding,
	Row,
	Text,
	Tooltip
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	Folder,
	getTags,
	isSharedAccountFolder,
	Tag,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-ui-commons';
import { map } from 'lodash';
import { Controller, UseFormSetValue } from 'react-hook-form';

import { AdvancedFilterModalFormValues, FormValuesControlProps, KeywordState } from '../types';
import { FolderIsContainedInModal } from 'components/modals/folder-is-contained-in';
import { getFolderIconColor } from 'helpers/folders';

type TagFolderRowControlProps = FormValuesControlProps & {
	setValue: UseFormSetValue<AdvancedFilterModalFormValues>;
};

export const TagFolderRow = ({
	control,
	setValue
}: TagFolderRowControlProps): React.JSX.Element => {
	const tagOptions: Array<Tag & { label: string; customComponent: React.JSX.Element }> = useMemo(
		() =>
			map(getTags(), (item) => ({
				...item,
				label: item.name,
				customComponent: (
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Row takeAvailableSpace mainAlignment="space-between">
							<Row mainAlignment="flex-end">
								<Padding right="small">
									<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[item.color ?? 0].hex} />
								</Padding>
							</Row>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Tooltip label={item.name} overflowTooltip>
									<Text>{item.name}</Text>
								</Tooltip>
							</Row>
						</Row>
					</Row>
				)
			})),
		[]
	);
	const [open, setOpen] = useState(false);
	const onClose = useCallback(() => setOpen(false), []);
	const openFolderModal = useCallback(() => setOpen(true), []);

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
	const folderChipOnAdd = useCallback(
		(label: unknown) => {
			if (typeof label !== 'string') {
				return undefined;
			}
			return chipOnAdd(label, 'in', true, false, true, 'FolderOutline', '');
		},
		[chipOnAdd]
	);

	const tagChipOnAdd = useCallback(
		(label: string, values: KeywordState) => {
			const alreadyExists = values.some(
				({ label: currentLabel }) => currentLabel === `tag:${label}`
			);
			if (alreadyExists) {
				return undefined;
			}
			const chipBg = tagOptions.filter((tag) => tag.label === label);
			return chipOnAdd(
				label,
				'tag',
				true,
				false,
				true,
				'Tag',
				ZIMBRA_STANDARD_COLORS[chipBg[0]?.color ?? 0].hex
			);
		},
		[chipOnAdd, tagOptions]
	);

	const confirmAction = useCallback(
		(folderDestination: Folder | undefined, _onClose: () => void) => {
			folderDestination &&
				setValue('folderInput', [
					{
						id: '',
						label: `in:${folderDestination?.absFolderPath}`,
						hasAvatar: true,
						maxWidth: '12.5rem',
						isGeneric: false,
						background: 'gray2',
						avatarBackground: getFolderIconColor(folderDestination),
						avatarIcon: 'FolderOutline',
						isQueryFilter: true,
						value: isSharedAccountFolder(folderDestination?.id)
							? `inid:"${folderDestination?.id}"`
							: `in:"${folderDestination?.absFolderPath}"`
					}
				]);
			_onClose();
		},
		[setValue]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Container padding={{ right: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'tagInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							placeholder={t('label.tags', 'Tags')}
							background="gray5"
							defaultValue={[]}
							options={tagOptions}
							value={value}
							// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
							onChange={(chips) => {
								const validChips = chips.filter((chip) => chip !== undefined);
								onChange(validChips);
							}}
							onAdd={
								((label) => {
									if (typeof label !== 'string') {
										return undefined;
									}
									return tagChipOnAdd(label, value);
								}) as ChipInputProps['onAdd']
							}
							disableOptions={false}
							disabled
							data-testid="tagInput"
						/>
					)}
				/>
			</Container>
			<Container padding={{ left: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'folderInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							background="gray5"
							icon="FolderOutline"
							placeholder={t('share.is_contained_in', 'Is contained in')}
							value={value}
							onChange={onChange}
							onAdd={folderChipOnAdd as ChipInputProps['onAdd']}
							disabled
							iconAction={openFolderModal}
							data-testid="folderInput"
						/>
					)}
				/>
				<CustomModal open={open} onClose={onClose} maxHeight="90vh" size={'medium'}>
					<FolderIsContainedInModal onClose={onClose} confirmAction={confirmAction} />
				</CustomModal>
			</Container>
		</Container>
	);
};
