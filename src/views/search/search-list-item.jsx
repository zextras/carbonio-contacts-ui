/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { ZIMBRA_STANDARD_COLORS, pushHistory, useTags } from '@zextras/carbonio-shell-ui';
import { includes, reduce, trim } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks/redux';
import { searchContacts } from '../../store/actions/search-contacts';
import { selectFolderStatus } from '../../store/selectors/contacts';
import { ItemAvatar } from '../app/folder-panel/item-avatar';
import { RowInfo } from '../app/folder-panel/item-content';
import ListItemActionWrapper from '../folder/list-item-action-wrapper';

const getChipLabel = (item) => {
	if (item.firstName ?? item.middleName ?? item.lastName) {
		return trim(`${item.firstName ?? ''} ${item.middleName ?? ''} ${item.lastName ?? ''}`);
	}
	return item.fullName ?? item?.email?.email?.mail ?? '';
};
const SearchListItem = ({ item, selected, selecting, toggle, active }) => {
	const dispatch = useDispatch();
	const folderId = item.parent;
	const folderStatus = useAppSelector((state) => selectFolderStatus(state, folderId));

	const _onClick = useCallback(() => {
		if (!folderStatus) {
			dispatch(searchContacts(folderId));
		}
		pushHistory(`/folder/${item.parent}/contacts/${item.id}`);
	}, [dispatch, folderId, folderStatus, item]);

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
	const tagsFromStore = useTags();

	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(item.tags, v.id))
						acc.push({ ...v, color: ZIMBRA_STANDARD_COLORS[parseInt(v.color ?? '0', 10)].hex });
					return acc;
				},
				[]
			),
		[item.tags, tagsFromStore]
	);
	return (
		<Container mainAlignment="flex-start" data-testid={`ConversationListItem-${item.id}`}>
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
							<Container orientation="horizontal" height="fit" width="fill">
								<Row wrap="nowrap" takeAvailableSpace mainAlignment="flex-start">
									<Text>{label}</Text>
								</Row>
								<RowInfo item={item} tags={tags} />
							</Container>
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
