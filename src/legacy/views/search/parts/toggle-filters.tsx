/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Switch, Text, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { Controller, useFormContext } from 'react-hook-form';

import { AdvancedFilterModalFormValues } from '../types';

export type ToggleFiltersProps = {
	compProps: {
		isSharedFolderIncludedTobe: boolean;
		setIsSharedFolderIncludedTobe: (arg: boolean) => void;
	};
};

export const ToggleFilters = (): React.JSX.Element => {
	const { control } = useFormContext<AdvancedFilterModalFormValues>();
	return (
		<Container orientation="horizontal" mainAlignment="center" crossAlignment="center">
			<Container
				padding={{ all: 'extrasmall' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Container orientation="horizontal" mainAlignment="flex-start" crossAlignment="center">
					<Padding right="small">
						<Controller
							control={control}
							name={'isSharedFolderIncluded'}
							render={({ field: { onChange, value } }): React.JSX.Element => (
								<Switch
									data-testid="isSharedFolderIncludedToggle"
									onClick={(): void => onChange(!value)}
									value={value}
								/>
							)}
						/>
					</Padding>
					<Text size="large" weight="bold">
						{t('label.include_shared_folders', 'Include Shared Folders')}
					</Text>
				</Container>
				<Padding bottom="small" />
				<Text color="secondary" size="small" overflow="break-word">
					{t('label.include_shared_folders', 'Include shared address books')}
				</Text>
				<Padding bottom="small" />
			</Container>
		</Container>
	);
};
