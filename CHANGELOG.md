# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.10.2](https://github.com/zextras/carbonio-contacts-ui/compare/v1.10.1...v1.10.2) (2024-04-18)


### Bug Fixes

* avoid search view crash [#217](https://github.com/zextras/carbonio-contacts-ui/issues/217) ([f2d173c](https://github.com/zextras/carbonio-contacts-ui/commit/f2d173c3839cfdc95133cd16a15b046c36d3038d))
* restore 'find shares' button size ([be092c1](https://github.com/zextras/carbonio-contacts-ui/commit/be092c19a076d0b8f00ffa303dc81d0c2b7e3092))

### [1.10.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.10.0...v1.10.1) (2024-04-12)


### Bug Fixes

* increase threshold to avoid to trigger onListBottom when scrollIntoView occurs ([94c3edf](https://github.com/zextras/carbonio-contacts-ui/commit/94c3edf5e544d27c536ddace9bb23a8ed1db9c1f)), closes [#209](https://github.com/zextras/carbonio-contacts-ui/issues/209)
* missing contact information in contact details ([3b51127](https://github.com/zextras/carbonio-contacts-ui/commit/3b5112780025db3042f40784c0ed949b7e0ff7b2))
* user is not able to empty some contact fields ([64b0459](https://github.com/zextras/carbonio-contacts-ui/commit/64b0459817514db2ade593b7a7c7745c225604d3))

## [1.10.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.9.0...v1.10.0) (2024-02-23)


### Features

* change icon in primary bar for contacts group and distribution lists ([15bb915](https://github.com/zextras/carbonio-contacts-ui/commit/15bb91516817dcfa7da510b75e05bae544b4531d))
* change primary bar icon for Contact groups and Distribution Lists ([9eec85a](https://github.com/zextras/carbonio-contacts-ui/commit/9eec85a08c943c7723091c792134dfcd164306cc))

## [1.9.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.8.1...v1.9.0) (2024-02-19)


### Features

* add contact groups visualization ([116c133](https://github.com/zextras/carbonio-contacts-ui/commit/116c1330d9062837d6205cb568e1af4879b9029e))
* allow distribution list owner to manage also details ([6006e43](https://github.com/zextras/carbonio-contacts-ui/commit/6006e436eb23f9aa76fc2763b562e324acd4cd65))
* contacts export feature added ([84231fa](https://github.com/zextras/carbonio-contacts-ui/commit/84231fa06ca18cdb14f746cc7cf96a95472c1a16))
* handle contact groups store when a new contact group is created or edited ([7996d17](https://github.com/zextras/carbonio-contacts-ui/commit/7996d17c47a4f764760fdbcd3e22d497f2b56386)), closes [#199](https://github.com/zextras/carbonio-contacts-ui/issues/199)
* let the user delete a group of contacts ([91c8d0a](https://github.com/zextras/carbonio-contacts-ui/commit/91c8d0a7c3a4a5298f5dfac5e6a6391ea48783ae))
* let the user edit a group of contacts ([107385b](https://github.com/zextras/carbonio-contacts-ui/commit/107385b371fb98e867757b7ad297a8e1b5dcb64f))
* let the user see distribution lists ([8915b79](https://github.com/zextras/carbonio-contacts-ui/commit/8915b79e0197380a1b63b2af1d2897d556412d3e))
* update list and displayer on dl edit ([ddd2db2](https://github.com/zextras/carbonio-contacts-ui/commit/ddd2db2eb1f21810f55d592418b96b5419e34dea)), closes [#198](https://github.com/zextras/carbonio-contacts-ui/issues/198)


### Bug Fixes

* after address book has been shared owner cannot see shared account name ([55df3bf](https://github.com/zextras/carbonio-contacts-ui/commit/55df3bf5fff7dba992e97c0646678af958fbddeb))
* **ContactInput:** update types and internal usages ([#176](https://github.com/zextras/carbonio-contacts-ui/issues/176)) ([d8d7023](https://github.com/zextras/carbonio-contacts-ui/commit/d8d70239853bc5fd00b829591c220be686bc95ee))
* enable the listing shared addressbooks belonging to owner without display name ([9c075e1](https://github.com/zextras/carbonio-contacts-ui/commit/9c075e1c7cd4adefaae5361815580736bd74ba3c))
* fix bug on edit contact of a shared address book ([#192](https://github.com/zextras/carbonio-contacts-ui/issues/192)) ([9f3f4f1](https://github.com/zextras/carbonio-contacts-ui/commit/9f3f4f1761b77d31eb94f119c1ec57af48957614))
* send email to a distribution list, contact group and to their members ([cc29b76](https://github.com/zextras/carbonio-contacts-ui/commit/cc29b76c7a724fe1d82f288e13624fc9bfbca40f))
* show member list if isOwner is true ([#187](https://github.com/zextras/carbonio-contacts-ui/issues/187)) ([7637c81](https://github.com/zextras/carbonio-contacts-ui/commit/7637c81ffb62f39944886298c23e99ff6027625d))

### [1.8.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.8.0...v1.8.1) (2024-01-19)

## [1.8.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.7.0...v1.8.0) (2024-01-12)


### Features

* change the icon position of the primary bar ([51f530d](https://github.com/zextras/carbonio-contacts-ui/commit/51f530d68101b306c5ca203051bdbf330ffe0258))
* change the icon position of the primary bar ([733497d](https://github.com/zextras/carbonio-contacts-ui/commit/733497d73991125ddf42eed67ea807b902d86c20))

## [1.7.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.6.4...v1.7.0) (2024-01-04)


### Features

* add DL editor ([df380a2](https://github.com/zextras/carbonio-contacts-ui/commit/df380a2d0eff125cd0ed0bb01ba5007aedfa916d))
* contact input receives a prop to customize chip label ([6a4fd5e](https://github.com/zextras/carbonio-contacts-ui/commit/6a4fd5ede78421f88905325375f8b74880e8e872))
* implement contacts groups creation ([1c7d7b5](https://github.com/zextras/carbonio-contacts-ui/commit/1c7d7b5bb05d4e33de24e7c81ec936518118c8a0))

### [1.6.4](https://github.com/zextras/carbonio-contacts-ui/compare/v1.6.3...v1.6.4) (2023-12-22)


### Bug Fixes

* fix fullautocomplete ([fe721d2](https://github.com/zextras/carbonio-contacts-ui/commit/fe721d20f10d8b34be7a4a950a8df2c644d435b8))

### [1.6.3](https://github.com/zextras/carbonio-contacts-ui/compare/v1.6.2...v1.6.3) (2023-12-18)


### Bug Fixes

* add elements to parseFullAutocompleteXML ([1b1f100](https://github.com/zextras/carbonio-contacts-ui/commit/1b1f100a99f05f15139636d16c552e94603ff848))

### [1.6.2](https://github.com/zextras/carbonio-contacts-ui/compare/v1.6.1...v1.6.2) (2023-12-11)


### Bug Fixes

* fix parsefullautocompletexml function ([35dd4d8](https://github.com/zextras/carbonio-contacts-ui/commit/35dd4d84972e46c2bc78b70aecb545daa98cc0c3))

### [1.6.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.6.0...v1.6.1) (2023-12-07)

## [1.6.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.5.0...v1.6.0) (2023-12-05)


### Features

* added fullAutocomplete API to contact input ([d62d21c](https://github.com/zextras/carbonio-contacts-ui/commit/d62d21cebef78886a66e75f5b5c6082878f389f7))
* added fullAutocomplete parser function ([eb4bde5](https://github.com/zextras/carbonio-contacts-ui/commit/eb4bde5a1b48b8f5a1c4bf0ed6251582775050c0))


### Bug Fixes

* fix autocomplete call ([4be766c](https://github.com/zextras/carbonio-contacts-ui/commit/4be766c82e40bb1d4e7a980a24160203f133c382))
* fix fullautocomplete request ([7f7720a](https://github.com/zextras/carbonio-contacts-ui/commit/7f7720a1cc0acb29a994b8805ab74c5fc609bc24))
* parse fullAutocomplete response ([2f8cd3e](https://github.com/zextras/carbonio-contacts-ui/commit/2f8cd3ec3fbe353dedbb3cb11c2f17168a455fae))

## [1.5.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.4.1...v1.5.0) (2023-11-23)


### Features

* distribution lists chip explosion ([8e1d65a](https://github.com/zextras/carbonio-contacts-ui/commit/8e1d65a5b5ede6b4191a145459280fd682d6b051))

### [1.4.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.4.0...v1.4.1) (2023-11-09)

## [1.4.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.3.4...v1.4.0) (2023-11-07)


### Features

* add drag and drop to chips ([43794a1](https://github.com/zextras/carbonio-contacts-ui/commit/43794a11f18439f7eeb2f836e6c380519dd5ff73))
* enable drag and drop of contacts ([a3be10b](https://github.com/zextras/carbonio-contacts-ui/commit/a3be10b08d1065b82a6a78e5e9259435bb2a062f))

### [1.3.4](https://github.com/zextras/carbonio-contacts-ui/compare/v1.3.3...v1.3.4) (2023-10-26)

### [1.3.3](https://github.com/zextras/carbonio-contacts-ui/compare/v1.3.2...v1.3.3) (2023-10-12)

### [1.3.2](https://github.com/zextras/carbonio-contacts-ui/compare/v1.3.1...v1.3.2) (2023-09-28)


### Bug Fixes

* can't edit a chip in contact-input ([ad34233](https://github.com/zextras/carbonio-contacts-ui/commit/ad34233a0777c01d3f9c230b5b327f70989d00ec))

### [1.3.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.3.0...v1.3.1) (2023-09-07)


### Bug Fixes

* **contact input:** differentiate groups from DLs ([0da5577](https://github.com/zextras/carbonio-contacts-ui/commit/0da55770fecdf5a5b0c3e7f21ec91f44543902a5))
* groups and distribution lists management are now separated ([cb569d0](https://github.com/zextras/carbonio-contacts-ui/commit/cb569d0daa1e82f37f8f9ffb8ae97e9224fe0afb))

## [1.3.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.5...v1.3.0) (2023-09-01)


### Features

* allow groups selection inside the contact-input ([0a57e2f](https://github.com/zextras/carbonio-contacts-ui/commit/0a57e2fe5ee087b7488c7892da3a499aedf87e1a))
* allow groups selection inside the contact-input ([43a0c77](https://github.com/zextras/carbonio-contacts-ui/commit/43a0c77e96a64b0a3d8be2dc16bbd76bacc30df9))
* allow groups selection inside the contact-input ([7b74737](https://github.com/zextras/carbonio-contacts-ui/commit/7b747372e701699f6e7e34192cbd43dbf2b5031f))

### [1.2.5](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.4...v1.2.5) (2023-07-20)

### [1.2.4](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.3...v1.2.4) (2023-07-06)


### Bug Fixes

* focus on composer name input during new contact creation ([#131](https://github.com/zextras/carbonio-contacts-ui/issues/131)) ([33dca35](https://github.com/zextras/carbonio-contacts-ui/commit/33dca3570f176b05ee2ed2d45dd03582db8d939c))
* sharing folder set 'send notification about this shared' is checked by default ([9cbc294](https://github.com/zextras/carbonio-contacts-ui/commit/9cbc29418545a197638b9deecdf66a143c2ae82c))

### [1.2.3](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.2...v1.2.3) (2023-05-24)

### [1.2.2](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.1...v1.2.2) (2023-04-27)


### Bug Fixes

* broken translations ([#121](https://github.com/zextras/carbonio-contacts-ui/issues/121)) ([5cafe51](https://github.com/zextras/carbonio-contacts-ui/commit/5cafe51b8d8d87d66255cd5c028cda5074e89c8a))
* fix imports of redux hooks ([fdb3a2a](https://github.com/zextras/carbonio-contacts-ui/commit/fdb3a2a60d1efbeab31580f4dcba12d0e49cd684))
* fix onclick ([#122](https://github.com/zextras/carbonio-contacts-ui/issues/122)) ([8c8ad25](https://github.com/zextras/carbonio-contacts-ui/commit/8c8ad25be39520b54fcee4cdafd1283b93f8430e))
* translate label for search module selector ([8ab7bc6](https://github.com/zextras/carbonio-contacts-ui/commit/8ab7bc6fdca7810c2a72e98bd3d0ea08d97d20fe))

### [1.2.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.2.0...v1.2.1) (2023-04-13)

## [1.2.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.5...v1.2.0) (2023-03-30)


### Features

* added option to select contact's address book destination ([c212aa7](https://github.com/zextras/carbonio-contacts-ui/commit/c212aa7614a61c3b57f6beaf7473aba0407c6a41))
* shared address books included in search ([048742b](https://github.com/zextras/carbonio-contacts-ui/commit/048742b7d2b906f5769fa72f13912bd333c0bf86))

### [1.1.5](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.4...v1.1.5) (2023-03-16)

### [1.1.4](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.3...v1.1.4) (2023-03-10)

### [1.1.3](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.2...v1.1.3) (2023-03-10)

### [1.1.2](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.1...v1.1.2) (2023-03-10)

### [1.1.1](https://github.com/zextras/carbonio-contacts-ui/compare/v1.1.0...v1.1.1) (2023-03-02)

## [1.1.0](https://github.com/zextras/carbonio-contacts-ui/compare/v1.0.0...v1.1.0) (2023-02-02)


### Features

* move trash folder position after system folders ([#97](https://github.com/zextras/carbonio-contacts-ui/issues/97)) ([8bf71f0](https://github.com/zextras/carbonio-contacts-ui/commit/8bf71f0fa503230cf9cf56b01f55cce99323b04b))


### Bug Fixes

* can not empty contacts address book ([#95](https://github.com/zextras/carbonio-contacts-ui/issues/95)) ([951ea23](https://github.com/zextras/carbonio-contacts-ui/commit/951ea237e176acbe2860334b1fb39aabc868d0cd))
* removed leading whitespace from autocomplete results ([#96](https://github.com/zextras/carbonio-contacts-ui/issues/96)) ([a9fed1e](https://github.com/zextras/carbonio-contacts-ui/commit/a9fed1efb374e6b6086c701fc7351100fffcc5cb))
* revoking the share is taking the shared folder to wrong state ([#92](https://github.com/zextras/carbonio-contacts-ui/issues/92)) ([bbf75f7](https://github.com/zextras/carbonio-contacts-ui/commit/bbf75f7d76782fcdf9bd19651e17fd0b740ce082))

## [1.0.0](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.33...v1.0.0) (2023-01-18)

### [0.1.33](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.32...v0.1.33) (2023-01-05)

### [0.1.32](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.31...v0.1.32) (2022-12-07)

### [0.1.31](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.30...v0.1.31) (2022-11-24)


### Bug Fixes

* workaround for chip separators with the azerty keyboard layout ([76e10a2](https://github.com/zextras/carbonio-contacts-ui/commit/76e10a268ed6f4b95c1e436547695bdbdbf86fed))

### [0.1.30](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.29...v0.1.30) (2022-11-15)

### [0.1.29](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.28...v0.1.29) (2022-11-15)


### Features

* contacts list sorting ([#74](https://github.com/zextras/carbonio-contacts-ui/issues/74)) ([47fcde3](https://github.com/zextras/carbonio-contacts-ui/commit/47fcde3509e2d0b25453a972613845395430bc40))
* convert px to rem ([ce7fcfd](https://github.com/zextras/carbonio-contacts-ui/commit/ce7fcfd067c6508f8cc9544b6c4a3dbe8ef2b919))


### Bug Fixes

* hardcoded translations removed ([#78](https://github.com/zextras/carbonio-contacts-ui/issues/78)) ([8c54c33](https://github.com/zextras/carbonio-contacts-ui/commit/8c54c339dac8dd37f12c8ced309eca0f6ba84cca))

### [0.1.28](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.27...v0.1.28) (2022-11-09)

### [0.1.27](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.26...v0.1.27) (2022-10-26)

### [0.1.26](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.25...v0.1.26) (2022-10-12)

### [0.1.25](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.24...v0.1.25) (2022-09-29)


### Bug Fixes

* restore list of available addressbooks on modals ([6b18300](https://github.com/zextras/carbonio-contacts-ui/commit/6b18300372315616cf8d4fc0aced78891f303835))

### [0.1.24](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.23...v0.1.24) (2022-09-28)


### Features

* code and UI alignment to the design system's new version ([#42](https://github.com/zextras/carbonio-contacts-ui/issues/42)) ([36cccce](https://github.com/zextras/carbonio-contacts-ui/commit/36cccce02d084c186371d445e6d48ed860bd7842))


### Bug Fixes

* german share translation ([9b01925](https://github.com/zextras/carbonio-contacts-ui/commit/9b019252653ca187aa4228f716fe8cdc79b3d697))
* restore missing tags and shared calendars on secondary bar ([b14ad3d](https://github.com/zextras/carbonio-contacts-ui/commit/b14ad3d5e62445bb2488fad6ac119d26f7876845))
* restore shared calendars and tags elements on secondary bar ([8b6e801](https://github.com/zextras/carbonio-contacts-ui/commit/8b6e8013bdcdfe204908381b8516a1bea0ad6bc6))

### [0.1.23](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.22...v0.1.23) (2022-09-15)

### [0.1.22](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.21...v0.1.22) (2022-08-31)


### Features

* added mandatory fields on contact form ([856c3a5](https://github.com/zextras/carbonio-contacts-ui/commit/856c3a553d5d8d57abaa4db19f4c5215de6150ad))


### Bug Fixes

* accordionItem correct width in sidebar component ([588c479](https://github.com/zextras/carbonio-contacts-ui/commit/588c479b3b06d235ba857f2655cded01e4d8ae91))

### [0.1.21](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.20...v0.1.21) (2022-08-01)

### [0.1.20](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.19...v0.1.20) (2022-07-21)


### Features

* press enter to select the first result of chipinput ([fe4eec5](https://github.com/zextras/carbonio-contacts-ui/commit/fe4eec585e7cfc0b0d272b7f9e39134ef9ef6758))
* tags implemented ([f4897d8](https://github.com/zextras/carbonio-contacts-ui/commit/f4897d8623d310e25e2a5eb2bfb96fa635fadaa6))


### Bug Fixes

* added support for shared addressbooks ([4a0fba7](https://github.com/zextras/carbonio-contacts-ui/commit/4a0fba795605c80f5e9e428dd016e71c28dce0ed))
* disable email button in case of contacts without emails ([#41](https://github.com/zextras/carbonio-contacts-ui/issues/41)) ([37af302](https://github.com/zextras/carbonio-contacts-ui/commit/37af3023a97f4b7c7738da71647121d20acc7ff5))
* use the folder's translated names in the secondary bar and modals ([ee68337](https://github.com/zextras/carbonio-contacts-ui/commit/ee68337624e43c05d81018fe49b551e8e0b847d5))

### [0.1.19](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.18...v0.1.19) (2022-06-20)

### [0.1.18](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.17...v0.1.18) (2022-06-09)


### Bug Fixes

* cannot change the addressbook color to black ([a2b0c94](https://github.com/zextras/carbonio-contacts-ui/commit/a2b0c94b2511c3f60b2118a15fc7a3849b49ad6f))
* fixed background to allow navigation on lists ([67a0c56](https://github.com/zextras/carbonio-contacts-ui/commit/67a0c56ed1b1db9e039b613ea79d5bfcb1db09b6))

### [0.1.17](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.16...v0.1.17) (2022-05-25)

### [0.1.16](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.15...v0.1.16) (2022-05-24)


### Features

* added addressbook sharing status icon ([e57cd94](https://github.com/zextras/carbonio-contacts-ui/commit/e57cd942fc78d4e9e5687ee5e0272b931609f7d0))
* added addressbook sharing status icon ([af7d43a](https://github.com/zextras/carbonio-contacts-ui/commit/af7d43adbcd2fd35bb1f38cc86d8e91db7518053))

### [0.1.15](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.14...v0.1.15) (2022-05-24)


### Bug Fixes

* items height and paddings on secondary bar ([7524edf](https://github.com/zextras/carbonio-contacts-ui/commit/7524edfbfee1533ba33aae3382a027049cb4ec14))
* padding on secondary bar accordion ([fef5b85](https://github.com/zextras/carbonio-contacts-ui/commit/fef5b85f37c5ad4f0d731c95bab9433a4d091352))

### [0.1.14](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.13...v0.1.14) (2022-05-12)

### [0.1.13](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.12...v0.1.13) (2022-05-12)


### Features

* passing create chips on paste prop ([29ab880](https://github.com/zextras/carbonio-contacts-ui/commit/29ab880959e3ec07f9dd85758f804dbb3cf431cb))


### Bug Fixes

* fixed console errors while syncing folders ([588d715](https://github.com/zextras/carbonio-contacts-ui/commit/588d715756cd22cd4651ab3a68478bc510979207))
* set drag component width ([d732655](https://github.com/zextras/carbonio-contacts-ui/commit/d7326551908de022f8e88c3897785cb9b6e4e304))
* set drag component width ([7643087](https://github.com/zextras/carbonio-contacts-ui/commit/76430878b8430f3b9e50f3438b819752931f3884))

### [0.1.12](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.11...v0.1.12) (2022-04-26)


### Bug Fixes

* prevents showing calendars in contact app ([ea08e91](https://github.com/zextras/carbonio-contacts-ui/commit/ea08e91e37040ca7d5da3bebfcbf7047989b341c))

### [0.1.11](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.10...v0.1.11) (2022-04-14)


### Bug Fixes

* fix contact input regex validation ([cd88d6f](https://github.com/zextras/carbonio-contacts-ui/commit/cd88d6f75d02fcec5787b5f4b8934b59660cf09e))

### [0.1.10](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.9...v0.1.10) (2022-04-14)


### Bug Fixes

* changed regex of email validation on contact input ([145bfd4](https://github.com/zextras/carbonio-contacts-ui/commit/145bfd446390a83ab835db6702ecd126ab064022))
* fix crash when mail-to action is undefined and sync deletion handlers ([b0cfafb](https://github.com/zextras/carbonio-contacts-ui/commit/b0cfafb13f9618b5856afe10e7ff87ad39324163))
* fixed email validation ([00536d8](https://github.com/zextras/carbonio-contacts-ui/commit/00536d8fd2f264e2c49e3cfcc8180b4d9beebccf))

### [0.1.9](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.7-rc.0...v0.1.9) (2022-04-01)


### Bug Fixes

* removed hardcoded labels ([e46924c](https://github.com/zextras/carbonio-contacts-ui/commit/e46924ce78f93aedda7edaacc16f85ee8242c3ae))
* removed hardcoded labels ([363907d](https://github.com/zextras/carbonio-contacts-ui/commit/363907d9cec5fe8deacfa425e7c0a5c47e30ad52))
* removed hardcoded labels ([f6d0784](https://github.com/zextras/carbonio-contacts-ui/commit/f6d07848add145505f0ff09fc685a2f741ea6297))

### [0.1.7-rc.0](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.5-rc.7...v0.1.7-rc.0) (2022-03-18)


### Features

* chipinput props passed to contact input ([be3351d](https://github.com/zextras/carbonio-contacts-ui/commit/be3351d74929b839c3a0b30f6e5fd2cb92606700))
* settings enhancements ([c101c49](https://github.com/zextras/carbonio-contacts-ui/commit/c101c49634a0f6755abc10692e0f130fd9859742))

### [0.1.5-rc.7](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.5-rc.6...v0.1.5-rc.7) (2022-02-24)


### Features

* applied breaking changes from shell ([7edaadd](https://github.com/zextras/carbonio-contacts-ui/commit/7edaaddb76e2e825ec0e934acb40b973903afd40))
* contacts sync ([5bf569d](https://github.com/zextras/carbonio-contacts-ui/commit/5bf569d6d90f5d94b2db5f1b50884a25c243519f))

### [0.1.5-rc.6](https://github.com/zextras/carbonio-contacts-ui/compare/v0.1.5-rc.5...v0.1.5-rc.6) (2022-02-10)

### 0.1.5-rc.5 (2022-01-21)


### Features

* first commit ([3404d00](https://github.com/zextras/carbonio-contacts-ui/commit/3404d00b76d813b5dc58d48778b3c1725a9439b0))


### Bug Fixes

* translation corrected for contact input ([c0a2fcc](https://github.com/zextras/carbonio-contacts-ui/commit/c0a2fcc68a02413d30eb12dc653b5f93411a52e2))
* translation fixed ([5902d47](https://github.com/zextras/carbonio-contacts-ui/commit/5902d47e45f3caaf068ac61951ac45aeca3f27ba))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.
