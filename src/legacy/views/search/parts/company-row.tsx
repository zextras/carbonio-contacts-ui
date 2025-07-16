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
		companyName: string;
		setCompanyName: (arg: string) => void;
	};
};
const CompanyNameRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { query, companyName, setCompanyName } = compProps;
	const [t] = useTranslation();

	const onChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setCompanyName(ev.currentTarget.value);
		},
		[setCompanyName]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Input
				label={t('label.company', 'Company')}
				background="gray5"
				value={companyName}
				onChange={onChange}
				defaultValue={companyName}
			/>
		</Container>
	);
};
export default CompanyNameRow;
