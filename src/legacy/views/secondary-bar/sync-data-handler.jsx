/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { forEach, isEmpty, sortBy } from 'lodash';

import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { folderWorker } from '../../../carbonio-ui-commons/worker';
import { useAppDispatch } from '../../hooks/redux';
import {
	handleCreatedContactsSync,
	handleDeletedContactsSync,
	handleModifiedContactsSync
} from '../../store/slices/contacts-slice';
import { normalizeSyncContactsFromSoap } from '../../utils/normalizations/normalize-contact-from-soap';

export const SyncDataHandler = () => {
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const refresh = useRefresh();
	const dispatch = useAppDispatch();
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!isEmpty(refresh) && !initialized) {
			setInitialized(true);
		}
	}, [dispatch, initialized, refresh]);

	useEffect(() => {
		if (initialized) {
			if (notifyList.length > 0) {
				forEach(sortBy(notifyList, 'seq'), (notify) => {
					if (!isEmpty(notify) && notify.seq > seq) {
						if (seq > 1 && notify.seq === 1) {
							const isNotifyRelatedToFolders =
								!isEmpty(notifyList) &&
								(notify?.created?.folder ||
									notify?.modified?.folder ||
									notify.deleted ||
									notify?.created?.link ||
									notify?.modified?.link);

							if (isNotifyRelatedToFolders) {
								folderWorker.postMessage({
									op: 'notify',
									notify,
									state: useFolderStore.getState().folders
								});
							}
						}
						if (notify.created?.cn) {
							dispatch(handleCreatedContactsSync(normalizeSyncContactsFromSoap(notify.created.cn)));
						}
						if (notify.modified?.cn) {
							const norm = normalizeSyncContactsFromSoap(notify.modified.cn);
							dispatch(handleModifiedContactsSync(norm));
						}
						if (notify.deleted?.length > 0) {
							dispatch(handleDeletedContactsSync(notify.deleted));
						}

						setSeq(notify.seq);
					}
				});
			}
		}
	}, [dispatch, initialized, notifyList, seq]);

	return null;
};
