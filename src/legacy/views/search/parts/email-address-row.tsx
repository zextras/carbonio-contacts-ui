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
						placeholder={t('advancedFilters.emailAddress', 'Email Address')}
						onChange={onChange}
						defaultValue={value}
						chipLabelFactory={chipLabelFactory}
					/>
				)}
			/>
		</Container>
	);
};
