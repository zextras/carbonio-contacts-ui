/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {setupTest} from "../../../../carbonio-ui-commons/test/test-setup";
import {SidebarAccordionMui} from "../sidebar-accordion";
import {generateStore} from "../../../tests/generators/store";
import {populateFoldersStore} from "../../../../carbonio-ui-commons/test/mocks/store/folders";
import {FOLDER_VIEW} from "../../../../carbonio-ui-commons/constants";
import React from "react";
import {Folder} from "../../../../carbonio-ui-commons/types";
import {generateFolder} from "../../../../carbonio-ui-commons/test/mocks/folders/folders-generator";
import {render, screen} from '@testing-library/react';
import {FOLDERS} from "../../../../carbonio-ui-commons/constants/folders";
import * as shellUi from "@zextras/carbonio-shell-ui";

describe('Sidebar Accordion', () => {

  it('should display Contact Groups only if Contacts is present', async () => {
    jest.spyOn(shellUi, 'useLocalStorage').mockReturnValue([[], jest.fn()])
    const fakeFolder = generateFolder({name: 'Contacts', id: FOLDERS.CONTACTS, children: []});
    const folders: Array<Folder> = [fakeFolder];
    setupTest(<SidebarAccordionMui folders={folders} initialExpanded={[]}  localStorageName={''} selectedFolderId={''}/>);
    expect(await screen.findByText('Contact Groups')).toBeVisible();
  });
})