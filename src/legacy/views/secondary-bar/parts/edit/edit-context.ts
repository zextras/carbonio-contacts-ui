/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createContext } from 'react';

import { Grant } from '../../../../../carbonio-ui-commons/types/folder';

export const Context = createContext<{
	setActiveGrant?: (grant: Grant) => void;
	activeModal?: string;
	setActiveModal?: (arg: string) => void;
	activeGrant?: Grant;
	onClose?: () => void;
}>({});
