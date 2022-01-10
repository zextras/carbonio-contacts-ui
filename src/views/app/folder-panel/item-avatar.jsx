/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Avatar, Container, Tooltip } from '@zextras/zapp-ui';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ItemAvatar = ({ item, selected, selecting, toggle, isSearch = false }) => {
	const [t] = useTranslation();
	const conversationSelect = useCallback(
		(id) => (ev) => {
			ev.preventDefault();
			toggle(id);
		},
		[toggle]
	);
	const activateSelectionMode = useMemo(
		() =>
			isSearch
				? t(
						'label.search_activate_selection_mode',
						'Selection mode isn’t available yet on search results'
				  )
				: t('label.activate_selection_mode', 'Activate selection mode'),
		[t, isSearch]
	);
	return (
		<Container
			data-testid={`AvatarContainer`}
			padding={{ all: 'small' }}
			width="fit"
			mainAlignment="flex-start"
		>
			<Tooltip label={activateSelectionMode} disabled={selecting} maxWidth="100%">
				<Avatar
					selecting={selecting}
					selected={selected}
					label={`${item.firstName} ${item.lastName}`}
					onClick={conversationSelect(item.id)}
					size="large"
				/>
			</Tooltip>
		</Container>
	);
};
