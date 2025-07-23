/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { CONTACT_TYPES, ContactInputProps, useContactInput } from '@zextras/carbonio-ui-commons';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormValuesControlProps } from '../types';

export const EmailAddressRow = ({ control }: FormValuesControlProps): React.JSX.Element => {
	const ContactInput = useContactInput();
	const [t] = useTranslation();

	const chipLabelFactory = useCallback<NonNullable<ContactInputProps['chipLabelFactory']>>(
		(value, defaultLabel): string => {
			if (value.type === CONTACT_TYPES.CONTACT) {
				return value.email;
			}
			return defaultLabel;
		},
		[]
	);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Controller
				control={control}
				name={'emailAddress'}
				render={({ field: { onChange, value } }): React.JSX.Element => (
					<ContactInput
						data-testid={'email-address-input'}
						placeholder={t('label.email_address', 'Email Address')}
						onChange={onChange}
						defaultValue={value}
						chipLabelFactory={chipLabelFactory}
					/>
				)}
			/>
		</Container>
	);
};

// import React, { FC, ReactElement, useCallback } from 'react';

// import { ChipInput, Container } from '@zextras/carbonio-design-system';
// import { useTranslation } from 'react-i18next';

// import { Query } from 'legacy/views/search/search-types';

// export type EmailAddressState = Query;

// type ComponentProps = {
// 	compProps: {
// 		query: Query;
// 		emailAddress: EmailAddressState;
// 		setEmailAddress: (arg: EmailAddressState) => void;
// 	};
// };
// const EmailAddressRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
// 	const { query, emailAddress, setEmailAddress } = compProps;
// 	const [t] = useTranslation();

// 	const onChangeLastName = useCallback(
// 		(eAddress: EmailAddressState) => {
// 			setEmailAddress(eAddress);
// 		},
// 		[setEmailAddress]
// 	);

// 	const emailAddressChipOnAdd = useCallback(
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
// 				placeholder={t('label.email_address', 'Email Address')}
// 				background="gray5"
// 				value={emailAddress}
// 				onChange={onChangeLastName}
// 				defaultValue={query}
// 				onAdd={emailAddressChipOnAdd}
// 				maxChips={1}
// 				requireUniqueChips
// 			/>
// 		</Container>
// 	);
// };
// export default EmailAddressRow;
