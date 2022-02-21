/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNotify, useRefresh, store } from '@zextras/carbonio-shell-ui';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'lodash';
import {
	handleDeletedContactsSync,
	handleModifiedContactsSync,
	handleCreatedContactsSync
} from '../../store/slices/contacts-slice';
import { handleFoldersSync, handleRefresh } from '../../store/slices/folders-slice';
import reducers from '../../store/reducers/reducers';
import { normalizeSyncContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

export const SyncDataHandler = () => {
	const notify = useNotify();
	const refresh = useRefresh();
	const dispatch = useDispatch();
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			store.setReducer(reducers);
			dispatch(handleRefresh(refresh));
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (!isEmpty(notify) && initialized) {
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
		}
	}, [dispatch, initialized, notify]);

	return null;
};
