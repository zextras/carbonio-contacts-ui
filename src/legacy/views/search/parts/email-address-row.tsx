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
		emailAddress: string;
		setEmailAddress: (arg: string) => void;
	};
};
const EmailAddressRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
	const { query, emailAddress, setEmailAddress } = compProps;
	const [t] = useTranslation();

	const onChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setEmailAddress(ev.currentTarget.value);
		},
		[setEmailAddress]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Input
				label={t('label.email_address', 'Email Address')}
				background="gray5"
				value={emailAddress}
				onChange={onChange}
				defaultValue={emailAddress}
			/>
		</Container>
	);
};
export default EmailAddressRow;
