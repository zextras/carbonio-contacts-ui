/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { Checkbox, Row } from '@zextras/carbonio-design-system';
import { last } from 'lodash';
import { useTranslation } from 'react-i18next';

import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { getFolderTranslatedName } from '../../../legacy/utils/helpers';
import { ShareInfo } from '../../../model/share-info';

export type SharesListItemProps = {
	share: ShareInfo;
	onSelect: (share: ShareInfo) => void;
	onDeselect: (share: ShareInfo) => void;
};

export const SharesListItem: FC<SharesListItemProps> = ({ share, onSelect, onDeselect }) => {
	const [t] = useTranslation();
	const shareName = useMemo<string>(() => {
		const { id } = getFolderIdParts(share.folderId);
		const name = last(share.folderPath.split('/')) ?? '';
		if (!id) {
			return name;
		}
		return getFolderTranslatedName(t, id, name);
	}, [share.folderId, share.folderPath, t]);

	const onSelectionChange = useCallback(
		(checked: boolean) => {
			checked ? onSelect(share) : onDeselect(share);
		},
		[onDeselect, onSelect, share]
	);

	return (
		<Row>
			<Checkbox label={shareName} onChange={onSelectionChange} defaultChecked={false} />
		</Row>
	);
};
