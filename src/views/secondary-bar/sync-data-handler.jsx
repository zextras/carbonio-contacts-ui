/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNotify, useRefresh, store } from '@zextras/carbonio-shell-ui';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isEmpty, map, reduce, forEach, sortBy } from 'lodash';
import { getContacts } from '../../store/actions/get-contacts';
import { handleContactsSync } from '../../store/slices/contacts-slice';
import { handleFoldersSync, handleRefresh } from '../../store/slices/folders-slice';
import { getFolder } from '../../store/actions/get-folder';
import reducers from '../../store/reducers/reducers';

function normalizeDeleted(param) {
	return {
		contacts: param && param.cn ? param.cn[0].ids.split(',') : undefined,
		folders: param && param.folder ? param.folder[0].ids.split(',') : undefined
	};
}

function getCnIds(contacts) {
	return reduce(contacts || [], (acc, v) => acc.concat(v.id), []);
}

export const SyncDataHandler = () => {
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
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
		if (initialized) {
			if (notifyList.length > 0) {
				forEach(sortBy(notifyList, 'seq'), (notify) => {
					if (!isEmpty(notify) && notify.seq > seq) {
						if (notify.created?.cn) {
							dispatch(getContacts(map(notify.created.cn, (c) => c.id)));
						}
						if (notify.modified?.cn) {
							dispatch(getContacts(map(notify.modified.cn, (c) => c.id)));
						}
						if (notify.deleted?.length > 0) {
							dispatch(handleContactsSync(notify));
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
