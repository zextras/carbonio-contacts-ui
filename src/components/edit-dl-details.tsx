/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import {
	Container,
	Input,
	InputProps,
	TextArea,
	TextAreaProps
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { DistributionList } from '../model/distribution-list';

export type EditDLDetailsProps = {
	name: string;
	nameError?: string;
	description: string;
	onChange: (newData: Partial<Pick<DistributionList, 'displayName' | 'description'>>) => void;
};

export const EditDLDetails = ({
	name,
	nameError,
	description,
	onChange
}: EditDLDetailsProps): React.JSX.Element => {
	const [t] = useTranslation();

	const onDisplayNameChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			onChange({ displayName: ev.currentTarget.value });
		},
		[onChange]
	);

	const onDescriptionChange = useCallback<NonNullable<TextAreaProps['onChange']>>(
		(ev) => {
			onChange({ description: ev.currentTarget.value });
		},
		[onChange]
	);

	return (
		<Container gap={'1rem'} height={'auto'}>
			<Input
				label={t('edit_dl_component.input.name.label', 'Distribution List name')}
				value={name}
				onChange={onDisplayNameChange}
				description={nameError}
				hasError={!!nameError}
			/>
			<TextArea
				label={t('edit_dl_component.input.description.label', 'Description')}
				value={description}
				onChange={onDescriptionChange}
			/>
		</Container>
	);
};
