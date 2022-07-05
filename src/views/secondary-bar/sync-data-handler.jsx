/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { forEach, isEmpty, sortBy } from 'lodash';
import {
	handleDeletedContactsSync,
	handleModifiedContactsSync,
	handleCreatedContactsSync
} from '../../store/slices/contacts-slice';
import { handleFoldersSync, handleRefresh } from '../../store/slices/folders-slice';
import { normalizeSyncContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

export const SyncDataHandler = () => {
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const refresh = useRefresh();
	const dispatch = useDispatch();
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			dispatch(handleRefresh(refresh));
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (initialized) {
			if (notifyList.length > 0) {
				forEach(sortBy(notifyList, 'seq'), (notify) => {
					if (!isEmpty(notify) && notify.seq > seq) {
						if (notify.created?.cn) {
							dispatch(handleCreatedContactsSync(normalizeSyncContactsFromSoap(notify.created.cn)));
						}
						if (notify.modified?.cn) {
							const norm = normalizeSyncContactsFromSoap(notify.modified.cn);
							dispatch(handleModifiedContactsSync(norm));
						}
						if (notify.deleted?.id) {
							dispatch(handleDeletedContactsSync(notify.deleted?.id));
						}
						if (
							notify.deleted?.length > 0 ||
							notify.modified?.folder ||
							notify.created?.folder ||
							notify.modified?.link ||
							notify.created?.link
						) {
							dispatch(handleFoldersSync(notify));
						}

						setSeq(notify.seq);
					}
				});
			}
		}
	}, [dispatch, initialized, notifyList, seq]);

	return null;
};
