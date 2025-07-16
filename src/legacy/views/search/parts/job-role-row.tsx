/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback } from 'react';

import { Container, Input, InputProps } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Query } from 'legacy/views/search/search-types';

export type KeywordState = Query;

type ComponentProps = {
	compProps: {
		query: Query;
		jobRole: string;
		setJobRole: (arg: string) => void;
	};
};
const JobRoleRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { query, jobRole, setJobRole } = compProps;
	const [t] = useTranslation();

	const onChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setJobRole(ev.currentTarget.value);
		},
		[setJobRole]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Input
				label={t('label.job_role', 'Job Role')}
				background="gray5"
				value={jobRole}
				onChange={onChange}
				defaultValue={jobRole}
			/>
		</Container>
	);
};
export default JobRoleRow;
