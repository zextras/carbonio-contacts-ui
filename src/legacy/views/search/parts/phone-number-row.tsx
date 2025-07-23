/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Container, ChipInput } from '@zextras/carbonio-design-system';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormValuesControlProps } from '../types';

export const PhoneNumberRow = ({ control }: FormValuesControlProps): ReactElement => {
	const [t] = useTranslation();
	const preText = 'field[phoneNumber]';

	const phoneNumberChipOnAdd = useCallback((label: string | unknown) => {
		const phoneValue = `field[homePhone]:${label} OR field[mobilePhone]:${label} OR field[workPhone]:${label} OR field[otherPhone]:${label}`;
		return {
			label: `${preText}:${label}`,
			hasAvatar: false,
			isGeneric: false,
			isQueryFilter: true,
			value: phoneValue
		};
	}, []);

	return (
		<Container padding={{ bottom: 'small', top: 'medium' }} orientation="horizontal">
			<Controller
				control={control}
				name={'phoneNumberInput'}
				render={({ field: { onChange, value } }): React.JSX.Element => (
					<ChipInput
						placeholder={t('label.phone_number', 'Phone Number')}
						data-testid={'phone-number-input'}
						background="gray5"
						value={value}
						separators={[
							{ key: 'Enter', ctrlKey: false },
							{ key: ',', ctrlKey: false }
						]}
						onChange={onChange}
						onAdd={phoneNumberChipOnAdd}
						requireUniqueChips
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

// export type PhoneNumberState = Query;

// type ComponentProps = {
// 	compProps: {
// 		query: Query;
// 		phoneNumber: PhoneNumberState;
// 		setPhoneNumber: (arg: PhoneNumberState) => void;
// 	};
// };
// const PhoneNumberRow: FC<ComponentProps> = ({ compProps }): ReactElement => {
// 	const { query, phoneNumber, setPhoneNumber } = compProps;
// 	const [t] = useTranslation();

// 	const onChangePhoneNumber = useCallback(
// 		(pNumber: PhoneNumberState) => {
// 			setPhoneNumber(pNumber);
// 		},
// 		[setPhoneNumber]
// 	);

// 	const phoneNumberChipOnAdd = useCallback(
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
// 				placeholder={t('label.phone_number', 'Phone Number')}
// 				background="gray5"
// 				value={phoneNumber}
// 				onChange={onChangePhoneNumber}
// 				defaultValue={query}
// 				onAdd={phoneNumberChipOnAdd}
// 				maxChips={1}
// 				requireUniqueChips
// 			/>
// 		</Container>
// 	);
// };
// export default PhoneNumberRow;
