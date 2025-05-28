/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable no-param-reassign */

import { useEffect, useRef, useState } from 'react';

import { SoapNotify, useNotify } from '@zextras/carbonio-shell-ui';
import { forEach, isEmpty, sortBy } from 'lodash';

import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { useTagStore } from '@zextras/carbonio-ui-commons';
import { folderWorker, tagsWorker } from '@zextras/carbonio-ui-commons';
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

function handleCreatedContacts(createdContacts: Array<SoapContact>): void {
	if (createdContacts.length > 0) {
		const normalizedContacts = normalizeContactsFromSoap(createdContacts);
		addContactsToStore(normalizedContacts);
	}
}

function handleModifiedContacts(modifiedContacts: Array<PartialSoapContactWithId>): void {
	if (modifiedContacts.length > 0) {
		const partialContacts = normalizeSyncContactsFromSoap(modifiedContacts);
		partialContacts && updateContactsInStore(partialContacts);
	}
}

function handleDeletedContacts(deletedContacts: Array<string>): void {
	if (deletedContacts.length > 0) {
		removeContactsFromStore(deletedContacts);
	}
}

function processNotification(
	notify: SoapNotify,
	seq: number,
	setSeq: React.Dispatch<React.SetStateAction<number>>,
	processedNotify: React.MutableRefObject<number>
): void {
	const isSequenceReset = processedNotify.current > 1 && notify.seq === 1;
	if (
		(processedNotify.current >= notify.seq && !isSequenceReset) ||
		isEmpty(notify) ||
		(notify.seq <= seq && !(seq > 1 && notify.seq === 1))
	) {
		return;
	}

	processedNotify.current = notify.seq;

	handleFoldersNotify(seq, [notify], notify, folderWorker, useFolderStore);
	tagsWorker.postMessage({
		op: 'notify',
		notify,
		state: useTagStore.getState().tags
	});

	const { created, modified, deleted } = notify;

	if (created && 'cn' in created) {
		handleCreatedContacts(created.cn as Array<SoapContact>);
	}

	if (modified && 'cn' in modified) {
		handleModifiedContacts(modified.cn as Array<PartialSoapContactWithId>);
	}

	if (deleted) {
		handleDeletedContacts(deleted);
	}

	setSeq(notify.seq);
}

export const useSyncDataHandler = (): void => {
	const notifyList = useNotify();
	const [seq, setSeq] = useState(-1);

	const processedNotify = useRef<number>(-1);
	useEffect(() => {
		if (notifyList.length === 0) return;

		forEach(sortBy(notifyList, 'seq'), (notify) => {
			if (!isEmpty(notify) && notify.seq > seq) {
				processNotification(notify, seq, setSeq, processedNotify);
			}
		});
	}, [notifyList, seq]);
};
