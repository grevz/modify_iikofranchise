// ==UserScript==
// @name         iiko Core Script
// @namespace    https://github.com/grevz/modify_iikofranchise
// @version      1.0.1
// @description  Базовый скрипт для iiko
// @match        https://franchise-1.iiko.it/*
// @updateURL    https://raw.githubusercontent.com/grevz/modify_iikofranchise/main/iiko-core.user.js
// @downloadURL  https://raw.githubusercontent.com/grevz/modify_iikofranchise/main/iiko-core.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (location.hostname === 'franchise-1.iiko.it') {
        console.log('Ты во франшизе но в новой версии 1.0.1. Удачи!');
    }
})();
