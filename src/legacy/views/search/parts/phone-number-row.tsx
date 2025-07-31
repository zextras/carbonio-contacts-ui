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
	const phoneNumberLabelPrefix = 'Phone';

	const phoneNumberChipOnAdd = useCallback((value: unknown) => {
		const label = typeof value === 'string' ? value : String(value);
		const phoneValue = `field[homePhone]:${label} OR field[mobilePhone]:${label} OR field[workPhone]:${label} OR field[otherPhone]:${label}`;
		return {
			label: `${phoneNumberLabelPrefix}:${label}`,
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
						placeholder={t('advancedFilters.phoneNumber', 'Phone Number')}
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
