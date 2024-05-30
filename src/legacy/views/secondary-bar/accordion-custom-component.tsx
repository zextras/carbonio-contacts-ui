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
	DragObj,
	Drop,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip
} from '@zextras/carbonio-design-system';
import { AppLink, FOLDERS, ROOT_NAME, useUserAccount } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useAddressBookContextualMenuItems } from './commons/use-address-book-contextual-menu-items';
import { useActionMoveAddressBook } from '../../../actions/move-address-book';
import { useActionMoveContacts } from '../../../actions/move-contacts';
import { isLink, isRoot } from '../../../carbonio-ui-commons/helpers/folders';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { DragEnterAction, OnDropActionProps } from '../../../carbonio-ui-commons/types/sidebar';
import { getFolderIconColor, getFolderIconName } from '../../../helpers/folders';
import { Contact } from '../../types/contact';
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

const AccordionCustomComponent: FC<{ item: Folder }> = ({ item: folder }) => {
	const [t] = useTranslation();
	const accountName = useUserAccount().name;
	const moveContactAction = useActionMoveContacts();
	const moveAddressBookAction = useActionMoveAddressBook();

	const onDragEnterAction = useCallback(
		(dragInfo: OnDropActionProps<Contact | Folder | unknown>): DragEnterAction => {
			if (dragInfo.type === 'contact') {
				const actionAllowed = moveContactAction.canExecute({
					contacts: [dragInfo.data as Contact],
					newParentAddressBook: folder
				});
				if (actionAllowed) {
					return undefined;
				}
			}

			if (dragInfo.type === 'folder') {
				const actionAllowed = moveAddressBookAction.canExecute({
					addressBook: dragInfo.data as Folder,
					newParentAddressBook: folder
				});
				if (actionAllowed) {
					return undefined;
				}
			}

			return { success: false };
		},
		[folder, moveAddressBookAction, moveContactAction]
	);

	const onDropAction = (dragInfo: OnDropActionProps<Contact | Folder | unknown>): void => {
		const dragEnterResponse = onDragEnterAction(dragInfo);
		if (dragEnterResponse?.success === false) {
			return;
		}

		if (dragInfo.type === 'contact') {
			moveContactAction.execute({
				contacts: [dragInfo.data as Contact],
				newParentAddressBook: folder
			});
		}

		if (dragInfo.type === 'folder') {
			moveAddressBookAction.execute({
				addressBook: dragInfo.data as Folder,
				newParentAddressBook: folder
			});
		}
	};

	const dragFolderDisable = useMemo(() => false, []);

	const textProps: { size: 'small' } = useMemo(
		() => ({
			size: 'small'
		}),
		[]
	);
	const accordionItem = useMemo(
		() => ({
			...folder,
			label:
				folder.id === FOLDERS.USER_ROOT
					? accountName
					: getFolderTranslatedName(t, folder.id, folder.name) ?? '',
			icon: getFolderIconName(folder) ?? undefined,
			iconColor: getFolderIconColor(folder) ?? '',
			to: `/folder/${folder.id}`,
			textProps
		}),
		[folder, accountName, t, textProps]
	);

	const dropdownItems = useAddressBookContextualMenuItems(folder);

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

		if (isLink(folder)) {
			const tooltipText = t('tooltip.folder_linked_status', 'Linked to me');
			return RowWithIcon('Linked', 'linked', tooltipText);
		}
		if (folder.acl?.grant) {
			const tooltipText = t('tooltip.folder_sharing_status', {
				count: folder.acl.grant.length,
				defaultValue_one: 'Shared with {{count}} person',
				defaultValue: 'Shared with {{count}} people'
			});
			return RowWithIcon('Shared', 'shared', tooltipText);
		}
		return '';
	}, [folder, t]);

	// hide folders where a share was provided and subsequently removed
	if (folder.isLink && folder.broken) {
		return null;
	}

	return isRoot(folder.id) || (folder.isLink && folder.oname === ROOT_NAME) ? (
		<FittedRow>
			<Padding left="small">
				<Avatar label={accordionItem.label} colorLabel={accordionItem.iconColor} size="medium" />
			</Padding>
			<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
				<AccordionItem data-testid={`accordion-folder-item-${folder.id}`} item={accordionItem} />
			</Tooltip>
		</FittedRow>
	) : (
		<Row width="fill" minWidth={0}>
			<Drop
				acceptType={['contact', 'folder']}
				onDrop={(data: DragObj): void => {
					onDropAction({
						type: data.type ?? '',
						data: data.data,
						event: data.event
					} as OnDropActionProps);
				}}
				onDragEnter={(data: DragObj): { success: boolean } | undefined =>
					onDragEnterAction({
						type: data.type ?? '',
						data: data.data,
						event: data.event
					} as OnDropActionProps)
				}
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
						to={`/folder/${folder.id}`}
						style={{ width: '100%', height: '100%', textDecoration: 'none' }}
					>
						<Dropdown
							data-testid={`folder-context-menu-${folder.id}`}
							contextMenu
							items={dropdownItems}
							display="block"
							width="100%"
						>
							<Row>
								<Padding left="small" />
								<Tooltip label={accordionItem.label} placement="right" maxWidth="100%">
									<AccordionItem
										data-testid={`accordion-folder-item-${folder.id}`}
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
