/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect, useState } from 'react';

import { SoapNotify, useNotify } from '@zextras/carbonio-shell-ui';
import { forEach, isEmpty, sortBy } from 'lodash';

import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { useTagStore } from '../../../carbonio-ui-commons/store/zustand/tags';
import { folderWorker, tagsWorker } from '../../../carbonio-ui-commons/worker';
import { useAppDispatch } from '../../hooks/redux';
import {
	addContactsToStore,
	removeContactsFromStore,
	updateContactsInStore
} from '../../store/contacts';
import { PartialSoapContactWithId, SoapContact } from '../../types/soap';
import {
	normalizeContactsFromSoap,
	normalizeSyncContactsFromSoap
} from '../../utils/normalizations/normalize-contact-from-soap';

function handleFoldersNotify(
	seq: number,
	notifyList: SoapNotify[],
	notify: SoapNotify,
	worker: Worker,
	store: typeof useFolderStore
): void {
	const isNotifyRelatedToFolders =
		!isEmpty(notifyList) &&
		(notify?.created?.folder ||
			notify?.modified?.folder ||
			notify.deleted ||
			notify?.created?.link ||
			notify?.modified?.link);

	if (isNotifyRelatedToFolders) {
		worker.postMessage({
			op: 'notify',
			notify,
			state: store.getState().folders
		});
	}
}
export const useSyncDataHandler = (): void => {
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (notifyList.length <= 0) return;
		forEach(sortBy(notifyList, 'seq'), (notify) => {
			if (!isEmpty(notify) && notify.seq > seq) {
				handleFoldersNotify(seq, notifyList, notify, folderWorker, useFolderStore);
				tagsWorker.postMessage({
					op: 'notify',
					notify,
					state: useTagStore.getState().tags
				});

				const created = notify?.created;
				const { modified } = notify;
				if (created && 'cn' in created) {
					const createdContacts = created.cn as Array<SoapContact>;
					if (createdContacts.length > 0) {
						const normalizedCreatedContacts = normalizeContactsFromSoap(createdContacts);
						addContactsToStore(normalizedCreatedContacts);
					}
				}
				if (modified && 'cn' in modified) {
					const modifiedContacts = modified.cn as Array<PartialSoapContactWithId>;
					if (modifiedContacts.length > 0) {
						const partialContacts = normalizeSyncContactsFromSoap(modifiedContacts);
						partialContacts && updateContactsInStore(partialContacts);
					}
				}
				if (notify.deleted?.length > 0) {
					removeContactsFromStore(notify.deleted);
				}

				setSeq(notify.seq);
			}
		});
	}, [dispatch, notifyList, seq]);
};
