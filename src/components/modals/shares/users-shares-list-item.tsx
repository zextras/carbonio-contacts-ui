/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useMemo, useState } from 'react';

import {
	Collapse,
	Icon,
	IconButton,
	ListItem,
	ListV2,
	Row,
	TextWithTooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { SharesListItem } from './shares-list-item';
import { ShareInfo } from '../../../model/share-info';

export type UsersSharesListItemProps = {
	shares: Array<ShareInfo>;
	ownerId: string;
	ownerName: string;
	onSelect: (share: ShareInfo) => void;
	onDeselect: (share: ShareInfo) => void;
};

export const UsersSharesListItem: FC<UsersSharesListItemProps> = ({
	shares,
	ownerId,
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
		<Row key={ownerId} padding={'small'}>
			<Row>
				<Icon icon={'PersonOutline'} />
				<TextWithTooltip>{label}</TextWithTooltip>
			</Row>
			<IconButton icon={expanded ? 'ChevronUp' : 'ChevronDown'} onClick={onChevronClick} />
			<Collapse open={expanded}>
				<ListV2>
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
				</ListV2>
			</Collapse>
		</Row>
	);
};
