/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DefaultTheme } from 'styled-components';

export type UIAction<ExecArg, CanExecArg> = {
	id: string;
	label: string;
	icon: keyof DefaultTheme['icons'];
	execute: (arg?: ExecArg) => void;
	canExecute: (arg?: CanExecArg) => boolean;
};
