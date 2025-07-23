/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useCallback } from 'react';

import { ChipInput, Container } from '@zextras/carbonio-design-system';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormValuesControlProps } from '../types';

export const CompanyJobRoleRow = ({ control }: FormValuesControlProps): ReactElement => {
	const [t] = useTranslation();
	const companyPrefix = 'field[company]';
	const jobRolePrefix = 'field[jobRole]';
	const chipOnAdd = useCallback(
		(
			label: string,
			preText: string,
			hasAvatar: boolean,
			isGeneric: boolean,
			isQueryFilter: boolean
		) => ({
			label: `${preText}:${label}`,
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
		} => chipOnAdd(label as string, companyPrefix, false, false, true),
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
		} => chipOnAdd(label as string, jobRolePrefix, false, false, true),
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
							placeholder={t('label.company', 'Company')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={companyChipOnAdd}
							// maxChips={1}
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
							placeholder={t('label.job_role', 'Job Role')}
							background="gray5"
							value={value}
							onChange={onChange}
							onAdd={jobRoleChipOnAdd}
							requireUniqueChips
						/>
					)}
				/>
			</Container>
		</Container>
	);
};

// import React, { FC, ReactElement, useCallback } from 'react';

// import { ChipInput, Container } from '@zextras/carbonio-design-system';
// import { useTranslation } from 'react-i18next';

// import { Query } from 'legacy/views/search/search-types';

// export type JobRoleState = Query;

// type ComponentProps = {
// 	compProps: {
// 		query: Query;
// 		jobRole: JobRoleState;
// 		setJobRole: (arg: JobRoleState) => void;
// 	};
// };
// const JobRoleRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
// 	const { query, jobRole, setJobRole } = compProps;
// 	const [t] = useTranslation();

// 	const onChangeJobRole = useCallback(
// 		(jRole: JobRoleState) => {
// 			setJobRole(jRole);
// 		},
// 		[setJobRole]
// 	);

// 	const jobRoleChipOnAdd = useCallback(
// 		(label: unknown): Query[number] => ({
// 			label: label as string,
// 			hasAvatar: false,
// 			isGeneric: true
// 		}),
// 		[]
// 	);

// 	return (
// 		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
// 			<ChipInput
// 				placeholder={t('label.job_role', 'Job Role')}
// 				background="gray5"
// 				value={jobRole}
// 				onChange={onChangeJobRole}
// 				defaultValue={query}
// 				onAdd={jobRoleChipOnAdd}
// 				maxChips={1}
// 				requireUniqueChips
// 			/>
// 		</Container>
// 	);
// };
// export default JobRoleRow;
