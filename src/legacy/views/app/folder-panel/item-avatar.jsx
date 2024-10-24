/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Avatar, Container, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const AvatarElement = styled(Avatar)`
	width: 2.625rem !important;
	height: 2.625rem !important;
	min-width: 2.625rem !important;
	min-height: 2.625rem !important;
	p {
		font-size: 0.875rem;
	}
`;
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
				<AvatarElement
					selecting={selecting}
					selected={selected}
					label={`${item.firstName} ${item.middleName} ${item.lastName}`}
					onClick={conversationSelect(item.id)}
					size="large"
				/>
			</Tooltip>
		</Container>
	);
};
