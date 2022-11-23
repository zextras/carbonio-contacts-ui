/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { ReactElement } from 'react';

export const useHistory = jest.fn(() => ({
	location: {
		pathname: 'fakepath'
	},
	push: jest.fn()
}));

export const useParams = jest.fn(() => ({ folderId: FOLDERS.INBOX }));
export const Prompt = (): ReactElement => <></>;
