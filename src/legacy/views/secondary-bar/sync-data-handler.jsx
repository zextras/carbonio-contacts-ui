/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { useNotify, useRefresh } from '@zextras/carbonio-shell-ui';
import { forEach, isEmpty, sortBy } from 'lodash';

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
