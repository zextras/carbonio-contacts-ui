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
	description: string;
	onChange: (newData: Partial<Pick<DistributionList, 'displayName' | 'description'>>) => void;
};

export const EditDLDetails = ({
	name,
	description,
	onChange
}: EditDLDetailsProps): React.JSX.Element => {
	const [t] = useTranslation();

	const onDisplayNameInput = useCallback<NonNullable<InputProps['onInput']>>(
		(ev) => {
			if (ev.target instanceof HTMLInputElement) {
				onChange({ displayName: ev.target.value });
			}
		},
		[onChange]
	);

	const onDescriptionInput = useCallback<NonNullable<TextAreaProps['onInput']>>(
		(ev) => {
			onChange({ description: ev.currentTarget.value });
		},
		[onChange]
	);

	return (
		<Container padding={{ top: 'large' }} gap={'1rem'} height={'auto'}>
			<Input
				label={t('edit_dl_component.input.name', 'Distribution List name')}
				defaultValue={name}
				onInput={onDisplayNameInput}
			/>
			<TextArea
				label={t('edit_dl_component.input.description', 'Description')}
				defaultValue={description}
				onInput={onDescriptionInput}
			/>
		</Container>
	);
};
