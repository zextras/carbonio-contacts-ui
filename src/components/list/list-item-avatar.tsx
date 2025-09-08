/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { SyntheticEvent, useCallback, useMemo } from 'react';

import styled from '@emotion/styled';
import { Avatar, Container, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

const AvatarElement = styled(Avatar)`
	width: 2.625rem !important;
	height: 2.625rem !important;
	min-width: 2.625rem !important;
	min-height: 2.625rem !important;
	p {
		font-size: 0.875rem;
	}
	& > svg {
		max-width: 1.5rem;
		max-height: 1.5rem;
		min-width: 1.5rem;
		min-height: 1.5rem;
	}
`;

type ItemAvatarProps = {
	item: {
		id: string;
		label: string;
		icon?: string;
	};
	selected?: boolean;
	selecting?: boolean;
	toggle?: (id: string) => void;
	isSearch?: boolean;
};
export const ListItemAvatar = ({
	item,
	selected,
	selecting,
	toggle,
	isSearch = false
}: ItemAvatarProps): React.JSX.Element => {
	const [t] = useTranslation();
	const toggleSelectContact = useCallback(
		(id: string) =>
			(ev: SyntheticEvent): void => {
				ev.preventDefault();
				toggle?.(id);
			},
		[toggle]
	);
	const activateSelectionModeTooltipLabel = useMemo(
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
			<Tooltip label={activateSelectionModeTooltipLabel} disabled={selecting} maxWidth="100%">
				<AvatarElement
					selecting={selecting}
					selected={selected}
					label={item.label}
					icon={item.icon}
					onClick={toggleSelectContact(item.id)}
					size="large"
				/>
			</Tooltip>
		</Container>
	);
};
