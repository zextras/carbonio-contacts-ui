/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { ChipInput, Container } from '@zextras/carbonio-design-system';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormValuesControlProps } from 'legacy/views/search/types';

export const NameRow = ({ control }: FormValuesControlProps): ReactElement => {
	const [t] = useTranslation();
	const firstNameLabelPrefix = 'FirstName';
	const firstNamePrefix = 'field[firstName]';

	const lastNameLabelPrefix = 'LastName';
	const lastNamePrefix = 'field[lastName]';
	const chipOnAdd = useCallback(
		(
			label: string,
			preLabelText: string,
			preText: string,
			hasAvatar: boolean,
			isGeneric: boolean,
			isQueryFilter: boolean
		) => ({
			label: `${preLabelText}:${label}`,
			hasAvatar,
			isGeneric,
			isQueryFilter,
			value: `${preText}:${label}`
		}),
		[]
	);

	const firstNameChipOnAdd = useCallback(
		(label: unknown): any =>
			chipOnAdd(label as string, firstNameLabelPrefix, firstNamePrefix, false, false, true),
		[chipOnAdd]
	);

	const lastNameChipOnAdd = useCallback(
		(label: unknown): any =>
			chipOnAdd(label as string, lastNameLabelPrefix, lastNamePrefix, false, false, true),
		[chipOnAdd]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Container padding={{ right: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'firstNameInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							placeholder={t('name.first_name', 'First Name')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={firstNameChipOnAdd}
							maxChips={1}
							requireUniqueChips
						/>
					)}
				/>
			</Container>
			<Container padding={{ left: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'lastNameInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							placeholder={t('name.last_name', 'Last Name')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={lastNameChipOnAdd}
							maxChips={1}
							requireUniqueChips
						/>
					)}
				/>
			</Container>
		</Container>
	);
};
