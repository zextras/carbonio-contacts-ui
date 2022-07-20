/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { AppLink, ZIMBRA_STANDARD_COLORS, FOLDERS } from '@zextras/carbonio-shell-ui';
import {
	AccordionItem,
	Container,
	Dropdown,
	Drag,
	Drop,
	Icon,
	Row,
	Tooltip,
	Padding
} from '@zextras/carbonio-design-system';
import { map, filter } from 'lodash';
import { useSelector } from 'react-redux';
import { actionsRetriever } from '../secondary-bar/commons/folders-actions';
import { FolderActionsType } from '../../types/folder';
import { folderAction } from '../../store/actions/folder-action';
import { contactAction } from '../../store/actions/contact-action';
import { searchContacts } from '../../store/actions/search-contacts';
import { selectFolderStatus } from '../../store/selectors/contacts';
import { selectFolder } from '../../store/selectors/folders';
import { getFolderTranslatedName } from '../../utils/helpers';

const DropOverlayContainer = styled(Container)`
	position: absolute;
	width: calc(248px - ${(props) => (props.folder.level - 1) * 16}px);
	height: 100%;
	background: ${(props) => props.theme.palette.primary.regular};
	border-radius: 4px;
	border: 4px solid #d5e3f6;
	opacity: 0.4;
`;

const DropDenyOverlayContainer = styled(Container)`
	position: absolute;
	width: calc(248px - ${(props) => (props.folder.level - 1) * 16}px);
	height: 100%;
	background: ${(props) => props.theme.palette.gray1.regular};
	border-radius: 4px;
	border: 4px solid #d5e3f6;
	opacity: 0.4;
`;

export const dropdownActions = (
	folder,
	setAction,
	setCurrentFolder,
	t,
	dispatch,
	createModal,
	createSnackbar,
	trashFolder
) => {
	const modalFolder = folder;
	const actions = actionsRetriever(
		modalFolder,
		setAction,
		setCurrentFolder,
		t,
		dispatch,
		createModal,
		createSnackbar,
		trashFolder
	);

	switch (modalFolder.id) {
		case FOLDERS.CONTACTS:
		case FOLDERS.AUTO_CONTACTS:
			return map(
				filter(
					actions,
					(action) =>
						action.id !== 'emptyTrash' &&
						action.id !== FolderActionsType.REMOVE_FROM_LIST &&
						action.id !== FolderActionsType.SHARE_INFO
				),
				(action) =>
					action.id === FolderActionsType.MOVE || action.id === FolderActionsType.DELETE
						? { ...action, disabled: true }
						: action
			);
		case FOLDERS.TRASH:
			return map(
				filter(
					actions,
					(action) =>
						action.id !== FolderActionsType.REMOVE_FROM_LIST &&
						action.id !== FolderActionsType.SHARE_INFO
				),
				(action) => (action.id === FolderActionsType.EMPTY ? action : { ...action, disabled: true })
			);
		case 'shares':
			return [];
		// customizable folders
		default:
			return folder.isShared
				? map(
						filter(
							actions,
							(action) =>
								action.id === FolderActionsType.SHARE_INFO ||
								action.id === FolderActionsType.REMOVE_FROM_LIST ||
								action.id === FolderActionsType.EDIT
						),
						(action) => {
							if (action.id === 'moveToRoot' || action.id === FolderActionsType.NEW) {
								return { ...action, disabled: true };
							}
							return action;
						}
				  )
				: map(
						filter(
							actions,
							(action) =>
								action.id !== 'emptyTrash' &&
								action.id !== FolderActionsType.REMOVE_FROM_LIST &&
								action.id !== FolderActionsType.SHARE_INFO
						),
						(action) => {
							if (
								(modalFolder.level > 2 && action.id === FolderActionsType.NEW) ||
								(modalFolder.level > 2 &&
									modalFolder.parent === FOLDERS.USER_ROOT &&
									action.id === FolderActionsType.MOVE) ||
								(modalFolder.parent === FOLDERS.TRASH &&
									(action.id === FolderActionsType.NEW || action.id === FolderActionsType.EDIT)) ||
								(modalFolder?.path?.includes?.(`/${trashFolder?.label}/`) &&
									modalFolder.id !== FOLDERS.TRASH &&
									action.id === FolderActionsType.EMPTY)
							) {
								return { ...action, disabled: true };
							}
							return action;
						}
				  );
	}
};

const getFolderIconName = (folder) => {
	if ([FOLDERS.CONTACTS, FOLDERS.AUTO_CONTACTS, FOLDERS.TRASH].includes(folder.id)) {
		switch (folder.id) {
			case FOLDERS.CONTACTS:
				return 'PersonOutline';
			case FOLDERS.AUTO_CONTACTS:
				return 'EmailOutline';
			case FOLDERS.TRASH:
				return 'Trash2Outline';
			default:
				return 'FolderOutline';
		}
	}
	if (folder.id === 'shares' || folder.isShared) {
		return 'SharedAddressBookOutline';
	}

	return 'FolderOutline';
};

export const CustomAccordion = (
	folder,
	setAction,
	setCurrentFolder,
	t,
	dispatch,
	createModal,
	createSnackbar,
	replaceHistory
) => {
	const folderIconColor = folder.color
		? ZIMBRA_STANDARD_COLORS[folder.color].hex
		: ZIMBRA_STANDARD_COLORS[0].hex;

	const onDragEnterAction = (data) => {
		if (data.type === 'contact') {
			if (
				data.data.parentFolderId === folder.id || // same folder not allowed
				(folder.isShared && folder.perm.indexOf('w') === -1) // only if shared folder have write permission
			) {
				return { success: false };
			}
		}
		if (data.type === 'folder') {
			if (
				folder.id === data.data.id || // same folder not allowed
				folder.level + data.data.level > 3 || // rules for maximum 3 folder level
				folder.isShared //  shared folder not allowed
			)
				return { success: false };
		}
		return undefined;
	};

	const onDropAction = (data) => {
		const dragEnterResponse = onDragEnterAction(data);
		if (dragEnterResponse && dragEnterResponse?.success === false) return;
		let contactId = [data.data.id];
		if (
			data.type !== 'folder' &&
			data.data?.selectedIDs?.length &&
			data.data?.selectedIDs.includes(data.data.id)
		) {
			contactId = data.data?.selectedIDs;
		}

		if (data.type === 'folder') {
			dispatch(
				folderAction({
					folder: data.data,
					l: folder.id || FOLDERS.USER_ROOT,
					op: FolderActionsType.MOVE
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'success',
						label: t('folder.action.moved', 'Address book moved successfully'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `move`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		} else {
			dispatch(
				contactAction({
					contactsIDs: contactId,
					originID: data.data.parentFolderId,
					destinationID: folder.id || FOLDERS.USER_ROOT,
					op: FolderActionsType.MOVE
				})
			).then((res) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: folder.id === FOLDERS.TRASH ? FolderActionsType.RESTORE : FolderActionsType.MOVE,
						replace: true,
						type: 'info',
						label:
							folder.id === FOLDERS.TRASH
								? t('messages.snackbar.contact_restored', 'Contact restored')
								: t('messages.snackbar.contact_moved', 'Contact moved'),
						autoHideTimeout: 3000,
						actionLabel: t('action.goto_folder', 'Go to folder'),
						onActionClick: () => {
							replaceHistory(`/folder/${folder.id || Number(FOLDERS.USER_ROOT)}`);
						}
					});
				} else {
					createSnackbar({
						key: `edit`,
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		}
	};

	const Component = (props) => {
		const folderStatus = useSelector((state) => selectFolderStatus(state, folder.id));
		const trashFolder = useSelector((state) => selectFolder(state, FOLDERS.TRASH));

		const dragFolderDisable = useMemo(
			() => [3, 7, 13].includes(Number(folder.id)) || folder.isShared, // Default folders and shared folders not allowed to drag
			[]
		);
		const onClick = useCallback(
			(e) => {
				e.stopPropagation();
				if (folderStatus) {
					dispatch(searchContacts(folder.id));
				}
				setCurrentFolder(folder);
			},
			[folderStatus]
		);

		const dropActions = useMemo(
			() =>
				dropdownActions(
					folder,
					setAction,
					setCurrentFolder,
					t,
					dispatch,
					createModal,
					createSnackbar,
					trashFolder
				),
			[trashFolder]
		);
		const folderIconLabel = getFolderIconName(folder);
		const folderTranslatedLabel = getFolderTranslatedName(t, folder.id, folder.label);

		const translatedProps = {
			...props,
			item: {
				...props.item,
				label: folderTranslatedLabel
			}
		};

		const sharedStatusIcon = useMemo(() => {
			if (!folder.sharedWith?.grant || !folder.sharedWith?.grant?.length) {
				return '';
			}

			const tooltipText = t('tooltip.address_book_sharing_status', {
				count: folder.sharedWith.grant.length,
				defaultValue: 'Shared with 1 person',
				defaultValue_plural: 'Shared with {{count}} people'
			});

			return (
				<Padding left="small">
					<Tooltip placement="right" label={tooltipText}>
						<Row>
							<Icon icon="ArrowCircleRight" customColor="#ffb74d" size="large" />
						</Row>
					</Tooltip>
				</Padding>
			);
		}, []);

		return (
			<Drop
				acceptType={['contact', 'folder']}
				onDrop={(data) => onDropAction(data)}
				onDragEnter={(data) => onDragEnterAction(data)}
				overlayAcceptComponent={<DropOverlayContainer folder={folder} />}
				overlayDenyComponent={<DropDenyOverlayContainer folder={folder} />}
			>
				<Drag
					type="folder"
					data={folder}
					dragDisabled={dragFolderDisable}
					style={{ display: 'block' }}
				>
					<AppLink
						onClick={onClick}
						to={`/folder/${folder.id}`}
						style={{ width: '100%', height: '100%', textDecoration: 'none' }}
					>
						<Dropdown contextMenu items={dropActions} display="block" width="100%">
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} takeAvailableSpace>
								<Icon size="large" icon={folderIconLabel} customColor={folderIconColor} />
								<Tooltip label={folderTranslatedLabel} placement="right" maxWidth="100%">
									<AccordionItem {...translatedProps}>{sharedStatusIcon}</AccordionItem>
								</Tooltip>
							</Row>
						</Dropdown>
					</AppLink>
				</Drag>
			</Drop>
		);
	};
	return Component;
};

export const setCustomComponent = (
	accordions,
	setAction,
	setCurrentFolder,
	t,
	// eslint-disable-next-line default-param-last
	nestedFolders = accordions,
	dispatch,
	createModal,
	createSnackbar,
	replaceHistory
) =>
	map(accordions, (accordion) => ({
		...accordion,
		CustomComponent: CustomAccordion(
			accordion,
			setAction,
			setCurrentFolder,
			t,
			dispatch,
			createModal,
			createSnackbar,
			replaceHistory
		),
		items: accordion?.items?.length
			? setCustomComponent(
					accordion.items,
					setAction,
					setCurrentFolder,
					t,
					nestedFolders,
					dispatch,
					createModal,
					createSnackbar
			  )
			: []
	}));
