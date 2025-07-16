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
		phoneNumber: string;
		setPhoneNumber: (arg: string) => void;
	};
};
const PhoneNumberRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { query, phoneNumber, setPhoneNumber } = compProps;
	const [t] = useTranslation();

	const onChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setPhoneNumber(ev.currentTarget.value);
		},
		[setPhoneNumber]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Input
				label={t('label.phone_number', 'Phone Number')}
				background="gray5"
				value={phoneNumber}
				onChange={onChange}
				defaultValue={phoneNumber}
			/>
		</Container>
	);
};
export default PhoneNumberRow;
