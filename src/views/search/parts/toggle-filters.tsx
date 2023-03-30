/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, FC, ReactElement } from 'react';
import { Container, Switch, Text, Padding } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

export type ToggleFiltersProps = {
	compProps: {
		isSharedFolderIncludedTobe: boolean;
		setIsSharedFolderIncludedTobe: (arg: boolean) => void;
	};
};

const ToggleFilters: FC<ToggleFiltersProps> = ({ compProps }): ReactElement => {
	const { isSharedFolderIncludedTobe, setIsSharedFolderIncludedTobe } = compProps;
	const toggleSharedFolder = useCallback(() => {
		setIsSharedFolderIncludedTobe(!isSharedFolderIncludedTobe);
	}, [isSharedFolderIncludedTobe, setIsSharedFolderIncludedTobe]);

	return (
		<>
			<Container orientation="horizontal" mainAlignment="center" crossAlignment="center">
				<Container
					padding={{ all: 'extrasmall' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Container orientation="horizontal" mainAlignment="baseline" crossAlignment="center">
						<Padding right="small">
							<Switch onClick={toggleSharedFolder} value={isSharedFolderIncludedTobe} />
						</Padding>
						<Text size="large" weight="bold">
							{t('label.include_shared_folders', 'Include shared address books')}
						</Text>
					</Container>
					<Padding bottom="small" />
					<Text color="secondary" size="small" overflow="break-word">
						{t('search.shared_folders_note', 'Include shared address books in searches.')}
					</Text>
					<Padding bottom="small" />
				</Container>
			</Container>
		</>
	);
};

export default ToggleFilters;
