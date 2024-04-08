/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Icon,
	Input,
	ModalFooter,
	ModalHeader,
	Row,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { last } from 'lodash';
import { useTranslation } from 'react-i18next';

import { UsersSharesList } from './users-shares-list';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { TIMEOUTS } from '../../../constants';
import { getFolderTranslatedName } from '../../../legacy/utils/helpers';
import { ShareInfo } from '../../../model/share-info';
import { client } from '../../../network/client';

export type SharesModalProps = {
	onClose: () => void;
};
//
// const ContainerEl = styled(Container)`
// 	overflow-y: auto;
// 	display: block;
// `;
//
// const CustomItem = ({ item }) => {
// 	const [checked, setChecked] = useState(false);
// 	const [t] = useTranslation();
//
// 	const onClick = useCallback(() => {
// 		if (!checked) {
// 			item.setLinks(
// 				uniqWith(
// 					[
// 						...item.links,
// 						{
// 							id: item.id,
// 							name: item.label,
// 							folderId: item.folderId,
// 							ownerId: item.ownerId,
// 							ownerName: item.ownerName,
// 							of: t('label.of', 'of')
// 						}
// 					],
// 					isEqual
// 				)
// 			);
// 		} else {
// 			item.setLinks(filter(item.links, (v) => v.id !== item.id));
// 		}
// 		setChecked(!checked);
// 	}, [checked, item, t]);
//
// 	return (
// 		<>
// 			<Padding right="medium">
// 				<Checkbox value={checked} onClick={onClick} iconColor="primary" />
// 			</Padding>
// 			<AccordionItem item={item} />
// 		</>
// 	);
// };

export const SharesModal: FC<SharesModalProps> = ({ onClose }) => {
	// const [links, setLinks] = useState([]);
	// const [data, setData] = useState();
	// const dispatch = useAppDispatch();
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [sharesInfo, setSharesInfo] = useState<Array<ShareInfo>>([]);
	const [selectedShares, setSelectedShares] = useState<Array<ShareInfo>>([]);

	// Fetch the list of the shares
	useEffect(() => {
		client
			.getShareInfo()
			.then((shares) => {
				setSharesInfo(shares ?? []);
			})
			.catch(() => {
				createSnackbar({
					key: `getShareInfo-error-${new Date().toDateString()}`,
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.snackbar,
					hideButton: true
				});
			});
	}, [createSnackbar, t]);

	const onSharesSelection = useCallback((selection: Array<ShareInfo>) => {
		setSelectedShares([...selection]);
	}, []);

	const onConfirm = useCallback(() => {
		// TODO this is taken from the UsersSharesListItem component: consider to move it into a function/hook
		const labeledShares = selectedShares.map((share) => {
			const baseName = last(share.folderPath.split('/')) ?? '';
			const folderId = getFolderIdParts(share.folderId).id ?? '';
			const shareLocalizedBaseName = getFolderTranslatedName(t, folderId, baseName);
			return {
				...share,
				mountpointName: t('share.link_name', {
					shareName: shareLocalizedBaseName,
					ownerName: share.ownerName,
					defaultValue: '{{shareName}} of {{ownerName}}'
				})
			};
		});

		client
			.createMountpoints(labeledShares)
			.then(() => {
				createSnackbar({
					key: `share`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('share.share_added_succesfully', 'Shared added successfully'),
					autoHideTimeout: TIMEOUTS.snackbar
				});
				onClose();
			})
			.catch(() => {
				createSnackbar({
					key: `share`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: TIMEOUTS.snackbar
				});
			});
	}, [createSnackbar, onClose, selectedShares, t]);
	// const translatedFolders = useMemo(() => translateFoldersNames(t, folders), [t, folders]);
	//
	// const onConfirm = useCallback(() => {
	// 	dispatch(createMountpoint(links)).then((res) => {
	// 		if (res.type.includes('fulfilled')) {
	// 			createSnackbar({
	// 				key: `share`,
	// 				replace: true,
	// 				type: 'info',
	// 				hideButton: true,
	// 				label: t('share.share_added_succesfully', 'Shared added successfully'),
	// 				autoHideTimeout: 3000
	// 			});
	// 		} else {
	// 			createSnackbar({
	// 				key: `share`,
	// 				replace: true,
	// 				type: 'error',
	// 				hideButton: true,
	// 				label: t('label.error_try_again', 'Something went wrong, please try again'),
	// 				autoHideTimeout: 3000
	// 			});
	// 		}
	// 	});
	// 	onClose();
	// }, [links, dispatch, onClose, createSnackbar, t]);
	//
	// const shared = map(translatedFolders, (c) => ({
	// 	id: `${c.ownerName} - ${c.folderId} - ${c.granteeType} - ${c.granteeName}`,
	// 	label: last(split(c.folderPath, '/')),
	// 	open: true,
	// 	items: [],
	// 	ownerName: c.ownerName,
	// 	ownerId: c.ownerId,
	// 	checked: false,
	// 	folderId: c.folderId,
	// 	setLinks,
	// 	links,
	// 	CustomComponent: CustomItem
	// }));
	// const filteredFolders = useMemo(() => groupBy(shared, 'ownerName'), [shared]);
	// const nestedData = useMemo(
	// 	() =>
	// 		map(values(data ?? filteredFolders), (v) => ({
	// 			id: v[0].ownerId,
	// 			label: t('share.shared_items', {
	// 				value: v[0].ownerName,
	// 				defaultValue: "{{value}}'s shared address books"
	// 			}),
	// 			open: true,
	// 			icon: 'PersonOutline',
	// 			items: v,
	// 			divider: filteredFolders?.length > 0 || data?.length > 0,
	// 			background: undefined
	// 		})),
	// 	[data, filteredFolders, t]
	// );
	//
	// const filterResults = useCallback(
	// 	(ev) => {
	// 		setData(
	// 			pickBy(filteredFolders, (value, key) =>
	// 				startsWith(toLower(key), toLower(ev?.target?.value))
	// 			)
	// 		);
	// 	},
	// 	[filteredFolders]
	// );

	const isAddButtonDisabled = useMemo<boolean>(
		() => selectedShares.length === 0,
		[selectedShares.length]
	);

	return (
		<>
			<ModalHeader
				title={t('share.find_contact_shares', 'Find Contact Shares')}
				showCloseIcon
				onClose={onClose}
			/>
			<Row padding={{ top: 'large', bottom: 'small' }} width="fill" mainAlignment="flex-start">
				<Text>
					{t(
						'share.find_shares_label',
						'Select which address book you want to see in contact’s tree'
					)}
				</Text>
			</Row>
			<Row padding={{ top: 'small', bottom: 'large' }} width="fill">
				<Input
					data-testid={'find-users-filter-input'}
					label={t('share.filter_user', 'Find users')}
					backgroundColor="gray5"
					CustomIcon={({ hasFocus }): React.JSX.Element => (
						<Icon icon="FunnelOutline" size="large" color={hasFocus ? 'primary' : 'text'} />
					)}
					// onChange={filterResults}
				/>
			</Row>
			<Container orientation="vertical" mainAlignment="flex-start" maxHeight="40vh">
				<UsersSharesList shares={sharesInfo} onSelectionChange={onSharesSelection} />
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				confirmLabel={t('share.add', 'Add')}
				confirmDisabled={isAddButtonDisabled}
			/>
		</>
	);
};
