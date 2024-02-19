/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: T[SubKey] };
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type KebabToCamelCase<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
	? `${Lowercase<P1>}${Uppercase<P2>}${KebabToCamelCase<P3>}`
	: Lowercase<S>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
	}[Keys];

export type OptionalPropertyOf<T extends object> = Exclude<
	{
		[K in keyof T]: T extends Record<K, T[K]> ? never : K;
	}[keyof T],
	undefined
>;
