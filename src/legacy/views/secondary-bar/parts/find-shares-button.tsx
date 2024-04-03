/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, SyntheticEvent, useCallback, useMemo } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { SharesModal } from './shares-modal';
import { client } from '../../../../network/client';
import { useAppDispatch } from '../../../hooks/redux';
import { StoreProvider } from '../../../store/redux';

export const FindSharesButton: FC = () => {
	const dispatch = useAppDispatch();
	const createModal = useModal();

	const label = useMemo(() => t('label.find_shares', 'Find shares'), []);

	const openFindShares = useCallback(
		(ev: SyntheticEvent<HTMLButtonElement, Event> | KeyboardEvent): void => {
			ev.stopPropagation();
			client.getShareInfo().then((shares) => {
				if (!shares || shares.length === 0) {
					return;
				}

				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<SharesModal folders={shares} onClose={(): void => closeModal()} />
							</StoreProvider>
						)
					},
					true
				);
			});
		},
		[createModal, dispatch]
	);

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }} key="button-find-shares">
			<Button type="outlined" label={label} width="fill" color="primary" onClick={openFindShares} />
		</Container>
	);
};
