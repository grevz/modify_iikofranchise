// ==UserScript==
// @name         iiko Franchise Core
// @namespace    https://github.com/grevz/modify_iikofranchise
// @version      1.0.2
// @description  Core-скрипт для iiko Franchise (объединённый)
// @match        https://franchise-1.iiko.it/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/grevz/modify_iikofranchise/main/iiko-core.user.js
// @downloadURL  https://raw.githubusercontent.com/grevz/modify_iikofranchise/main/iiko-core.user.js
// ==/UserScript==

(function () {
    'use strict';

    /* =========================
       Bootstrap
    ========================== */

    if (location.hostname !== 'franchise-1.iiko.it') {
        return;
    }

    console.log('🧠 iiko Franchise Core загружен');

    /* =========================
       Utils
    ========================== */

    function onHashChange(cb) {
        window.addEventListener('hashchange', cb);
    }

    /* =========================
       Module 1: Выбор всех точек
    ========================== */

    (function moduleSelectAllPoints() {
        const allowedHashes = [
            '#api/nomenclature-exchange/',
            '#api/production/exchange-options'
        ];

        function isAllowedPage() {
            return allowedHashes.some(h => location.hash.startsWith(h));
        }

        function addButtonForLabel(labelText) {
            if (!isAllowedPage()) return;

            const label = Array.from(document.querySelectorAll('label'))
                .find(l => l.textContent.trim() === labelText);

            if (!label || label.dataset.buttonAdded) return;

            const btn = document.createElement('button');
            btn.textContent = 'Выбрать все';
            btn.type = 'button';
            btn.className = 'btn btn-default';
            btn.style.marginLeft = '10px';

            btn.onclick = () => {
                const multiselect = $("#targetConnectionGroups").data("kendoMultiSelect");
                if (!multiselect) return;

                const allValues = multiselect.dataSource
                    .data()
                    .map(i => i.value || i.id || i.text);

                const current = multiselect.value();
                const allSelected = allValues.every(v => current.includes(v));

                multiselect.value(allSelected ? [] : allValues);
                multiselect.trigger("change");
            };

            label.after(btn);
            label.dataset.buttonAdded = '1';
        }

        function run() {
            if (!isAllowedPage()) return;
            addButtonForLabel('Получатели');
            addButtonForLabel('Получатели:');
        }

        const observer = new MutationObserver(run);
        observer.observe(document.body, { childList: true, subtree: true });

        onHashChange(() => {
            document.querySelectorAll('label').forEach(l => delete l.dataset.buttonAdded);
            run();
        });

        run();
    })();

    /* =========================
       Module 2: Фильтрация строк
    ========================== */

    (function moduleFilterRows() {
        const TARGET_HASH = '#api/production/exchange-options';

        function parseDate(text) {
            const m = text.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (!m) return null;
            return new Date(+m[3], +m[2] - 1, +m[1]);
        }

        function filterRows() {
            if (location.hash !== TARGET_HASH) return;

            const tbody = document.querySelector('#source-elements .k-grid-content tbody[role="rowgroup"]');
            if (!tbody) return;

            const rows = tbody.querySelectorAll('tr[role="row"]');
            if (!rows.length) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            rows.forEach(row => {
                const cells = row.querySelectorAll('td[role="gridcell"]');
                if (cells.length < 5) {
                    row.style.display = 'none';
                    return;
                }

                const isFranchise = cells[1].innerText.toLowerCase().includes('франшиза');
                const isActive = cells[4].innerText.toLowerCase().includes('действующий');

                let dateOk = true;
                const date = parseDate(cells[3].innerText);
                if (date) {
                    date.setHours(0, 0, 0, 0);
                    dateOk = date >= today;
                }

                row.style.display = (isFranchise && isActive && dateOk) ? '' : 'none';
            });
        }

        const observer = new MutationObserver(filterRows);
        observer.observe(document.body, { childList: true, subtree: true });

        onHashChange(filterRows);
        filterRows();
    })();

    /* =========================
       Module 3: Scroll Restore
    ========================== */

(function moduleScrollRestore() {
    console.log('🚀 Scroll Restore module loaded');

    const headerSelector = '.k-grid-header';
    const containerSelector = '.k-grid-content';
    let currentContainer = null;

    function initScrollRestore(container) {
        console.log('✅ Init scroll restore on:', container);

        let savedScrollTop = 0;
        let active = false;
        let started = false;
        let stableFrames = 0;
        let lastScrollTop = 0;
        let lastHeight = 0;

        function loop() {
            if (!active) return;

            const st = container.scrollTop;
            const h = container.scrollHeight;

            if (!started) {
                if (st !== lastScrollTop || h !== lastHeight) {
                    started = true;
                    console.log('▶️ scroll update started');
                }
            }

            if (started) {
                if (st !== savedScrollTop) {
                    container.scrollTop = savedScrollTop;
                    stableFrames = 0;
                } else {
                    stableFrames++;
                }

                if (stableFrames >= 8) {
                    active = false;
                    console.log('🔓 scroll stabilized');
                    return;
                }
            }

            lastScrollTop = st;
            lastHeight = h;

            requestAnimationFrame(loop);
        }

        document.addEventListener('click', e => {
            if (!e.target.closest('.k-i-expand, .k-i-collapse')) return;

            setTimeout(() => {
                savedScrollTop = container.scrollTop;
                lastScrollTop = savedScrollTop;
                lastHeight = container.scrollHeight;

                active = true;
                started = false;
                stableFrames = 0;

                console.log('📌 scrollTop saved:', savedScrollTop);
                requestAnimationFrame(loop);
            }, 10);
        }, true);
    }

    const observer = new MutationObserver(() => {
        const header = document.querySelector(headerSelector);
        const container = document.querySelector(containerSelector);

        if (header && container && container !== currentContainer) {
            currentContainer = container;
            console.log('📊 Grid detected, enabling scroll restore');
            initScrollRestore(container);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
})();
