/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback, useMemo } from 'react';
import { trim, split, head } from 'lodash';
import { Container, Divider, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { useHistory, useLocation } from 'react-router-dom';
import { selectFolderStatus } from '../../store/selectors/contacts';
import { searchContacts } from '../../store/actions/search-contacts';
import ListItemActionWrapper from '../folder/list-item-action-wrapper';
import { ItemAvatar } from '../app/folder-panel/item-avatar';

const getChipLabel = (item) => {
	if (item.firstName ?? item.middleName ?? item.lastName) {
		return trim(`${item.firstName ?? ''} ${item.middleName ?? ''} ${item.lastName ?? ''}`);
	}
	return item.fullName ?? item?.email?.email?.mail ?? '';
};
const SearchListItem = ({ item, selected, selecting, toggle, active }) => {
	const history = useHistory();
	const { pathname } = useLocation();
	const dispatch = useDispatch();
	const folderId = item.parent;
	const folderStatus = useSelector((state) => selectFolderStatus(state, folderId));

	const _onClick = useCallback(() => {
		if (!folderStatus) {
			dispatch(searchContacts(folderId));
		}
		const path = head(split(pathname, '/folder'));
		history.push(`${path}/folder/${item.parent}/contacts/${item.id}`);
	}, [dispatch, folderId, folderStatus, history, item.id, item.parent, pathname]);

	const label = useMemo(() => getChipLabel(item), [item]);
	const secondaryRow = useMemo(
		() =>
			trim(
				`${Object.values(item.email).length > 0 ? Object.values(item.email)[0].mail : ''}, ${
					Object.values(item.phone).length > 0 ? Object.values(item.phone)[0].number : ''
				}`,
				', '
			),
		[item]
	);
	return (
		<Container
			background={active ? 'highlight' : 'gray6'}
			mainAlignment="flex-start"
			data-testid={`ConversationListItem-${item.id}`}
		>
			<ListItemActionWrapper item={item} current={active} onClick={_onClick} contact={item}>
				<div style={{ alignSelf: 'center' }} data-testid={`AvatarContainer`}>
					<ItemAvatar
						item={item}
						selected={selected}
						selecting={selecting}
						toggle={toggle}
						folderId={folderId}
						isSearch
					/>
					<Padding horizontal="extrasmall" />
				</div>
				<Row
					takeAvailableSpace
					wrap="wrap"
					mainAlignment="space-around"
					crossAlignment="flex-start"
					orientation="vertical"
					padding={{ left: 'small', top: 'small', bottom: 'small', right: 'large' }}
				>
					{label !== item?.email?.email?.mail ? (
						<>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Text size="small" weight="regular">
									{label}
								</Text>
							</Row>
							<Tooltip
								label={item?.email?.email?.mail}
								overflow="break-word"
								maxWidth="60vw"
								disabled={!item?.email?.email?.mail}
							>
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Text size="small" weight="regular" color="secondary">
										{secondaryRow}
									</Text>
								</Row>
							</Tooltip>
						</>
					) : (
						<Text size="large">{label}</Text>
					)}
				</Row>
			</ListItemActionWrapper>
		</Container>
	);
};

export default SearchListItem;
