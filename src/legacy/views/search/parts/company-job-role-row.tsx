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

export const CompanyJobRoleRow = ({ control }: FormValuesControlProps): ReactElement => {
	const [t] = useTranslation();
	const companyLabelPrefix = 'Company';
	const companyPrefix = 'field[company]';

	const jobRoleLabelPrefix = 'JobRole';
	const jobRolePrefix = 'field[jobRole]';
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

	const companyChipOnAdd = useCallback(
		(
			label: unknown
		): {
			label: string;
			hasAvatar: boolean;
			isGeneric: boolean;
			isQueryFilter: boolean;
			value: string;
		} => chipOnAdd(label as string, companyLabelPrefix, companyPrefix, false, false, true),
		[chipOnAdd]
	);

	const jobRoleChipOnAdd = useCallback(
		(
			label: unknown
		): {
			label: string;
			hasAvatar: boolean;
			isGeneric: boolean;
			isQueryFilter: boolean;
			value: string;
		} => chipOnAdd(label as string, jobRoleLabelPrefix, jobRolePrefix, false, false, true),
		[chipOnAdd]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Container padding={{ right: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'companyInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							placeholder={t('job.company', 'Company')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={companyChipOnAdd}
							maxChips={1}
							requireUniqueChips
						/>
					)}
				/>
			</Container>
			<Container padding={{ left: 'extrasmall' }} maxWidth="50%">
				<Controller
					control={control}
					name={'jobRoleInput'}
					render={({ field: { onChange, value } }): React.JSX.Element => (
						<ChipInput
							placeholder={t('job.title', 'Job Role')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={jobRoleChipOnAdd}
							maxChips={1}
							requireUniqueChips
						/>
					)}
				/>
			</Container>
		</Container>
	);
};
