/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useMemo, useState } from 'react';

import {
	Collapse,
	Container,
	IconButton,
	ListItem,
	List,
	Row,
	TextWithTooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { SharesListItem } from './shares-list-item';
import { ShareInfo } from '../../../model/share-info';
import { HoverRow } from '../../styled-components';

export type UsersSharesListItemProps = {
	shares: Array<ShareInfo>;
	ownerName: string;
	onSelect: (share: ShareInfo) => void;
	onDeselect: (share: ShareInfo) => void;
};

export const UsersSharesListItem: FC<UsersSharesListItemProps> = ({
	shares,
	ownerName,
	onDeselect,
	onSelect
}) => {
	const [t] = useTranslation();
	const [expanded, setExpanded] = useState<boolean>(true);

	const label = useMemo<string>(
		() =>
			t('share.shared_items', {
				value: ownerName,
				defaultValue: "{{value}}'s shared address books"
			}),
		[t, ownerName]
	);

	const onChevronClick = useCallback(() => {
		setExpanded((prev) => !prev);
	}, []);

	return (
		<Container crossAlignment={'flex-start'} padding={{ top: 'extrasmall' }}>
			<HoverRow
				padding={'small'}
				width={'fill'}
				mainAlignment={'space-between'}
				gap={'0.5rem'}
				wrap={'nowrap'}
				data-testid={'shares-users-list-item'}
			>
				<Row wrap={'nowrap'} gap={'0.5rem'} flexShrink={1} minWidth={'1rem'}>
					<TextWithTooltip>{label}</TextWithTooltip>
				</Row>
				<IconButton
					icon={expanded ? 'ChevronUp' : 'ChevronDown'}
					onClick={onChevronClick}
					customSize={{
						iconSize: 'large',
						paddingSize: 0
					}}
				/>
			</HoverRow>
			<Collapse open={expanded} crossSize="100%" orientation="vertical">
				<List>
					{shares.map((share) => (
						<ListItem key={share.folderUuid}>
							{(visible: boolean): React.JSX.Element =>
								visible ? (
									<SharesListItem share={share} onSelect={onSelect} onDeselect={onDeselect} />
								) : (
									<></>
								)
							}
						</ListItem>
					))}
				</List>
			</Collapse>
		</Container>
	);
};
