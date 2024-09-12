/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useRef } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Container } from '@mui/material';
import { useLocalStorage } from '@zextras/carbonio-shell-ui';

import { AccordionCustomComponent } from './accordion-custom-component';
import { ContactGroup } from './contact-group';
import { FindSharesButton } from './find-shares-button';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { isRoot } from '../../../carbonio-ui-commons/helpers/folders';
import { theme } from '../../../carbonio-ui-commons/theme/theme-mui';
import { Folder } from '../../../carbonio-ui-commons/types';
import type { SidebarAccordionProps } from '../../types/sidebar';

export type SidebarAccordionProps = {
	folders: Array<Folder>;
	selectedFolderId: string;
	localStorageName: string;
	initialExpanded: string[];
};

export const SidebarAccordionMui: FC<SidebarAccordionProps> = ({
	folders,
	selectedFolderId,
	localStorageName,
	initialExpanded
}) => {
	const [openIds, setOpenIds] = useLocalStorage<Array<string>>(
		localStorageName,
		initialExpanded ?? []
	);
	const sidebarRef = useRef<HTMLInputElement>(null);

	const onClick = useCallback(
		({ folder, expanded }: { folder: { id: string }; expanded: boolean }): void => {
			if (expanded) {
				setOpenIds((state: Array<string>) =>
					state.includes(folder.id) ? state : [...state, folder.id]
				);
			} else {
				setOpenIds((state: Array<string>) => state.filter((id) => id !== folder.id));
			}
		},
		[setOpenIds]
	);
	return (
		<Container ref={sidebarRef} disableGutters>
			{folders.map((folder) => (
				<div key="accordion-div-${folder.id}">
					<Accordion
						disableGutters
						slotProps={{ transition: { unmountOnExit: true } }}
						expanded={openIds.includes(folder.id)}
					>
						<AccordionSummary
							expandIcon={
								folder?.children &&
								folder.children.length > 0 && (
									<ExpandMoreIcon
										color="primary"
										onClick={(e): void => {
											e.preventDefault();
											onClick({ folder, expanded: !openIds.includes(folder.id) });
										}}
									/>
								)
							}
							aria-controls="panel1a-content"
							id={folder.id}
							sx={{
								backgroundColor:
									folder.id === selectedFolderId
										? theme.palette.highlight.hover
										: theme.palette.gray5.regular,
								'&:hover': {
									backgroundColor:
										folder.id === selectedFolderId
											? theme.palette.highlight.active
											: theme.palette.gray5.hover
								}
							}}
						>
							<AccordionCustomComponent item={folder} />
						</AccordionSummary>
						{folder?.children && folder.children.length > 0 && (
							<AccordionDetails>
								<SidebarAccordionMui
									folders={folder.children}
									selectedFolderId={selectedFolderId}
									key="accordion-mui-${folder.id}}"
									localStorageName={localStorageName}
									initialExpanded={initialExpanded}
								/>
								{isRoot(folder.id) && <FindSharesButton key="find-shares-btn-${folder.id}}" />}
							</AccordionDetails>
						)}
					</Accordion>
					{folder.id === FOLDERS.CONTACTS && <ContactGroup />}
				</div>
			))}
		</Container>
	);
};
