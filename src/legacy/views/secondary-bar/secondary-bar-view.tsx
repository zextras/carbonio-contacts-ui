/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { ThemeProvider } from '@mui/material';
import {
	Accordion,
	Button,
	Container,
	Divider,
	IconButton,
	Padding,
	Row,
	Tooltip
} from '@zextras/carbonio-design-system';
import {
	AppLink,
	FOLDERS,
	SecondaryBarComponentProps,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-shell-ui';
import { map, noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom';

import { AccordionCustomComponent } from './accordion-custom-component';
import { useActionAddSharedAddressBooks } from '../../../actions/add-shared-address-books';
import { SidebarAccordionMui } from '../../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { useRootsArray } from '../../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../../carbonio-ui-commons/theme/theme-mui';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { LOCAL_STORAGES } from '../../../constants';
import { sortFolders } from '../../../helpers/folders';
import useGetTagsAccordion from '../../hooks/use-get-tags-accordions';
import { getFolderTranslatedName } from '../../utils/helpers';

/**
 * Component for trigger the browsing and selection of
 * address books shared by other users
 */
const AddSharesButton = (): React.JSX.Element => {
	const [t] = useTranslation();
	const addSharesAction = useActionAddSharedAddressBooks();

	const isEnabled = useMemo(() => addSharesAction.canExecute(), [addSharesAction]);

	const label = useMemo(() => t('label.find_shares', 'Find shares'), [t]);

	const onClick = useCallback(() => {
		addSharesAction.execute();
	}, [addSharesAction]);

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }} key="button-find-shares">
			<Button
				type="outlined"
				label={label}
				width="fill"
				color="primary"
				onClick={onClick}
				disabled={!isEnabled}
			/>
		</Container>
	);
};

const folderIconName: Record<number, string> = {
	7: 'PersonOutline',
	13: 'EmailOutline',
	3: 'Trash2Outline'
};

/**
 * Item component for the collapsed secondary bar
 * @param folder
 */
export const CollapsedSideBarItems = ({ folder }: { folder: Folder }): React.JSX.Element => {
	const [t] = useTranslation();

	const folderIcon = useMemo(() => {
		if (Object.keys(folderIconName).includes(folder.id)) {
			return folderIconName[Number(folder.id)];
		}
		if (folder.id === 'shares' || folder.isLink) {
			return 'Share';
		}
		return 'Folder';
	}, [folder]);

	const folderIconColor = useMemo(
		() => (folder.color ? ZIMBRA_STANDARD_COLORS[folder.color].hex : ZIMBRA_STANDARD_COLORS[0].hex),
		[folder]
	);

	const folderIconTooltip = useMemo(
		() => getFolderTranslatedName(t, folder.id, folder.name),
		[folder.id, folder.name, t]
	);

	return (
		<>
			<AppLink to={`/folder/${folder.id}`} style={{ width: '100%', textDecoration: 'none' }}>
				<Row mainAlignment="flex-start" height={'fit'}>
					<Tooltip placement="right" label={folderIconTooltip}>
						<Padding all="extrasmall">
							<IconButton
								customSize={{ iconSize: 'large', paddingSize: 'small' }}
								icon={folderIcon}
								iconColor={folderIconColor}
								onClick={noop}
							/>
						</Padding>
					</Tooltip>
				</Row>
			</AppLink>
		</>
	);
};

const SecondaryBarView: FC<SecondaryBarComponentProps> = ({ expanded = false }) => {
	const { folderId: selectedFolderId } = useParams<{ folderId: string }>();
	const tagsAccordionItems = useGetTagsAccordion();
	const { path } = useRouteMatch();

	const roots = useRootsArray();
	// TODO Remove when IRIS-5083 will be implemented
	const filteredRoots = roots.filter((root) => root.id === FOLDERS.USER_ROOT);
	const folders = useMemo(() => sortFolders(filteredRoots), [filteredRoots]);

	const accordionsWithFindShare = useMemo(() => {
		if (!folders?.[0]?.children.find((folder: Folder) => folder.id === 'find_shares')) {
			folders[0]?.children?.push({
				id: 'find_shares',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				disableHover: true
			});
		}
		return map(folders, (item) => ({ ...item, background: 'gray4' }));
	}, [folders]);

	return (
		<>
			<ThemeProvider theme={themeMui}>
				{expanded ? (
					<Switch>
						<Route path={`${path}/folder/:folderId/:type?/:itemId?`}>
							<SidebarAccordionMui
								accordions={accordionsWithFindShare}
								folderId={selectedFolderId}
								localStorageName={LOCAL_STORAGES.EXPANDED_ADDRESSBOOKS}
								AccordionCustomComponent={AccordionCustomComponent}
								buttonFindShares={<AddSharesButton />}
								initialExpanded={[FOLDERS.USER_ROOT]}
							/>

							<Divider />
							<Accordion items={[tagsAccordionItems]} />
						</Route>
					</Switch>
				) : (
					folders[0].children.map((folder) => (
						<CollapsedSideBarItems key={folder.id} folder={folder} />
					))
				)}
			</ThemeProvider>
		</>
	);
};

export default SecondaryBarView;
