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
		firstName: string;
		setFirstName: (arg: string) => void;
		lastName: string;
		setLastName: (arg: string) => void;
	};
};
const NameRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { query, firstName, lastName, setFirstName, setLastName } = compProps;
	const [t] = useTranslation();

	const onChangeFirstName = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setFirstName(ev.currentTarget.value);
		},
		[setFirstName]
	);

	const onChangeLastName = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setLastName(ev.currentTarget.value);
		},
		[setLastName]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Container padding={{ right: 'extrasmall' }} maxWidth="50%">
				<Input
					label={t('label.firstName', 'First Name')}
					background="gray5"
					value={firstName}
					onChange={onChangeFirstName}
					defaultValue={firstName}
				/>
			</Container>
			<Container padding={{ left: 'extrasmall' }} maxWidth="50%">
				<Input
					label={t('label.lastName', 'Last Name')}
					background="gray5"
					value={lastName}
					onChange={onChangeLastName}
					defaultValue={lastName}
				/>
			</Container>
		</Container>
	);
};
export default NameRow;
