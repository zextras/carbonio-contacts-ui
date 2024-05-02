/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { ContainerProps } from '@mui/material';
import {
	AccordionItem,
	Avatar,
	Container,
	Drag,
	Drop,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { AppLink, FOLDERS, ROOT_NAME, useUserAccount } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useAddressBookContextualMenuItems } from './commons/use-address-book-contextual-menu-items';
import { useActionMoveAddressBook } from '../../../actions/move-address-book';
import { useActionMoveContact } from '../../../actions/move-contact';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { DragEnterAction, OnDropActionProps } from '../../../carbonio-ui-commons/types/sidebar';
import { getFolderIconColor, getFolderIconName } from '../../../helpers/folders';
import { useAppDispatch } from '../../hooks/redux';
import { getFolderTranslatedName } from '../../utils/helpers';

const FittedRow = styled(Row)`
	max-width: calc(100% - (2 * ${({ theme }): string => theme.sizes.padding.small}));
	height: 3rem;
`;

export const DropOverlayContainer = styled(Container)<ContainerProps & { folder: Folder }>`
	position: absolute;
	width: calc(15.5rem - ${(props): number => props.folder.depth - 2}rem);
	height: 100%;
	background: ${(props): string => props.theme.palette.primary.regular};
	border-radius: 0.25rem;
	border: 0.25rem solid #d5e3f6;
	opacity: 0.4;
`;

const DropDenyOverlayContainer = styled(Container)<ContainerProps & { folder: Folder }>`
	position: absolute;
	width: calc(15.5rem - ${(props): number => props.folder.depth - 2}rem);
	height: 100%;
	background: ${(props): string => props.theme.palette.gray1.regular};
	border-radius: 0.25rem;
	border: 0.25rem solid #d5e3f6;
	opacity: 0.4;
`;

const AccordionCustomComponent: FC<{ item: Folder }> = ({ item }) => {
	const [t] = useTranslation();
	const accountName = useUserAccount().name;
	const dispatch = useAppDispatch();
	const { folderId } = useParams<{ folderId: string }>();
	const createSnackbar = useSnackbar();
	const moveContactAction = useActionMoveContact();
	const moveAddressBookAction = useActionMoveAddressBook();

	const onDragEnterAction = useCallback(
		(data: OnDropActionProps): DragEnterAction => {
			if (data.type === 'contact') {
				if (
					data.data.parentFolderId === item.id || // same folder not allowed
					(data.data.parentFolderId === FOLDERS.INBOX && [5, 6].includes(Number(item.id))) || // from inbox not allowed in draft and sent
					(data.data.parentFolderId === FOLDERS.DRAFTS && ![3].includes(Number(item.id))) || // from draft only allowed in Trash
					(item.id === FOLDERS.DRAFTS && data.data.parentFolderId !== FOLDERS.TRASH) || // only from Trash can move in Draft
					(item.isLink && item.perm?.indexOf('w') === -1) || // only if shared folder have write permission
					item.id === FOLDERS.USER_ROOT ||
					(item.isLink && item.oname === ROOT_NAME)
				) {
					return { success: false };
				}
			}
			if (data.type === 'folder') {
				if (
					item.id === data.data.id || // same folder not allowed
					item.isLink || //  shared folder not allowed
					[FOLDERS.DRAFTS, FOLDERS.SPAM].includes(item.id) // cannot be moved inside Draft and Spam
				)
					return { success: false };
			}
			return undefined;
		},
		[item]
	);

	const onDropAction = (data: OnDropActionProps): void => {
		const dragEnterResponse = onDragEnterAction(data);
		if (dragEnterResponse && dragEnterResponse?.success === false) return;
		let convMsgsIds = [data.data.id];
		if (
			data.type !== 'folder' &&
			data.data?.selectedIDs?.length &&
			data.data?.selectedIDs.includes(data.data.id)
		) {
			convMsgsIds = data.data?.selectedIDs;
		}

		if (data.type === 'folder') {
			folderAction({ folder: data.data, l: item.id || FOLDERS.USER_ROOT, op: 'move' }).then(
				(res) => {
					if (!('Fault' in res)) {
						createSnackbar({
							key: `move`,
							replace: true,
							type: 'success',
							label: t('messages.snackbar.folder_moved', 'Folder successfully moved'),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: `move`,
							replace: true,
							type: 'error',
							label: t('label.error_try_again', 'Something went wrong, please try again.'),
							autoHideTimeout: 3000
						});
					}
				}
			);
		} else if ('messages' in data.data) {
			dispatch(
				convAction({
					operation: `move`,
					ids: convMsgsIds,
					parent: item.id
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					replaceHistory(`/folder/${folderId}`);
					data.data.deselectAll && data.data.deselectAll();
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'info',
						label: t('messages.snackbar.conversation_move', 'Conversation successfully moved'),
						autoHideTimeout: 3000,
						actionLabel: t('action.goto_folder', 'GO TO FOLDER'),
						onActionClick: () => {
							replaceHistory(`/folder/${item.id}`);
						}
					});
				} else {
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		} else {
			dispatch(
				msgAction({
					operation: `move`,
					ids: convMsgsIds,
					parent: item.id
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					data.data.deselectAll && data.data.deselectAll();
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'info',
						label: t('messages.snackbar.message_move', 'Message successfully moved'),
						autoHideTimeout: 3000,
						actionLabel: t('action.goto_folder', 'GO TO FOLDER'),
						onActionClick: () => {
							replaceHistory(`/folder/${item.id}`);
						}
					});
				} else {
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				}
			});
		}
	};

	const dragFolderDisable = useMemo(() => false, []);

	const onClick = useCallback((): void => {}, []);

	// const onClick = useCallback((): void => {
	// 	pushHistory(`/folder/${item.id}`);
	// 	dispatch(
	// 		search({
	// 			folderId: item.id,
	// 			limit: LIST_LIMIT.INITIAL_LIMIT,
	// 			sortBy: sortOrder,
	// 			types:
	// 				item.id === FOLDERS.DRAFTS || typeof zimbraPrefGroupMailBy !== 'string'
	// 					? 'message'
	// 					: zimbraPrefGroupMailBy
	// 		})
	// 	);
	// }, [dispatch, item.id, prefs.zimbraPrefSortOrder, zimbraPrefGroupMailBy]);

	const textProps: { size: 'small' } = useMemo(
		() => ({
			size: 'small'
		}),
		[]
	);
	const accordionItem = useMemo(
		() => ({
			...item,
			label:
				item.id === FOLDERS.USER_ROOT
					? accountName
					: getFolderTranslatedName(t, item.id, item.name) ?? '',
			icon: getFolderIconName(item) ?? undefined,
			iconColor: getFolderIconColor(item) ?? '',
			to: `/folder/${item.id}`,
			textProps
		}),
		[item, accountName, t, textProps]
	);

	const dropdownItems = useAddressBookContextualMenuItems(item);

	const statusIcon = useMemo(() => {
		const RowWithIcon = (icon: string, color: string, tooltipText: string): React.JSX.Element => (
			<Padding left="small">
				<Tooltip placement="right" label={tooltipText}>
					<Row>
						<Icon icon={icon} color={color} size="medium" />
					</Row>
				</Tooltip>
			</Padding>
		);

		if (item.acl?.grant) {
			const tooltipText = t('tooltip.folder_sharing_status', {
				count: item.acl.grant.length,
				defaultValue_one: 'Shared with {{count}} person',
				defaultValue: 'Shared with {{count}} people'
			});
			return RowWithIcon('Shared', 'shared', tooltipText);
		}
		if (item.isLink) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return RowWithIcon('Linked', 'linked', tooltipText);
		}
		return '';
	}, [item.acl?.grant, item.isLink, t]);

	// hide folders where a share was provided and subsequently removed
	if (item.isLink && item.broken) {
		return <></>;
	}

	return item.id === FOLDERS.USER_ROOT || (item.isLink && item.oname === ROOT_NAME) ? (
		<FittedRow>
			<Padding left="small">
				<Avatar label={accordionItem.label} colorLabel={accordionItem.iconColor} size="medium" />
			</Padding>
			<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
				<AccordionItem data-testid={`accordion-folder-item-${item.id}`} item={accordionItem} />
			</Tooltip>
		</FittedRow>
	) : (
		<Row width="fill" minWidth={0}>
			<Drop
				acceptType={['message', 'conversation', 'folder']}
				// onDrop={(data: DragObj): void => {
				// 	onDropAction({
				// 		type: data.type ?? '',
				// 		data: data.data,
				// 		event: data.event
				// 	} as OnDropActionProps);
				// }}
				// onDragEnter={(data: DragObj): { success: boolean } | undefined =>
				// 	onDragEnterAction({
				// 		type: data.type ?? '',
				// 		data: data.data,
				// 		event: data.event
				// 	} as OnDropActionProps)
				// }
				overlayAcceptComponent={<DropOverlayContainer folder={item} />}
				overlayDenyComponent={<DropDenyOverlayContainer folder={item} />}
			>
				<Drag
					type="folder"
					data={item}
					dragDisabled={dragFolderDisable}
					style={{ display: 'block' }}
				>
					<AppLink
						onClick={onClick}
						to={`/folder/${item.id}`}
						style={{ width: '100%', height: '100%', textDecoration: 'none' }}
					>
						<Dropdown
							data-testid={`folder-context-menu-${item.id}`}
							contextMenu
							items={dropdownItems}
							display="block"
							width="100%"
						>
							<Row>
								<Padding left="small" />
								<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
									<AccordionItem
										data-testid={`accordion-folder-item-${item.id}`}
										item={accordionItem}
									>
										{statusIcon}
									</AccordionItem>
								</Tooltip>
							</Row>
						</Dropdown>
					</AppLink>
				</Drag>
			</Drop>
		</Row>
	);
};

export default AccordionCustomComponent;