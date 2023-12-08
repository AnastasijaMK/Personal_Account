$(document).ready(function() {
    // Маски
    $("input[type='tel']").mask("+7 (999) 999 99 99");
    // Перенос курсора в начало поля
    $.fn.setCursorPosition = function (pos) {
        if ($(this).get(0).setSelectionRange) {
            $(this).get(0).setSelectionRange(pos, pos);
        } else if ($(this).get(0).createTextRange) {
            var range = $(this).get(0).createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };
    $('input[type="tel"]').click(function () {
        if ($(this).val() === "+7 (___) ___ __ __") {
            $(this).setCursorPosition(4);
        }
    });
});


// Корректировка отображения всплывающих окон на мобильной версии
function calcVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
calcVh();

window.addEventListener('resize',()=>{
    calcVh();
    if(document.documentElement.clientWidth > 1239) {
        checkOrderName();
    }
});


// Вывод дней или д. в блоке "Финансы" в шапке
const financeBlock = document.querySelector('.widget--finance .widget__header .widget__label--block');
correctFinanceBlock(financeBlock);
window.addEventListener('resize',()=>{
    correctFinanceBlock(financeBlock);
});
function correctFinanceBlock(financeBlock) {
    if(financeBlock && document.documentElement.clientWidth > 1239) {
        const financeBlockValue = 14;
        if((financeBlockValue > 9 && document.documentElement.clientWidth < 1760) || document.documentElement.clientWidth < 1440) {
            financeBlock.innerText = financeBlockValue + 'д. до блокировки';
        } else {
            financeBlock.innerText = financeBlockValue + ' ' + getNoun(financeBlockValue, 'день', 'дня', 'дней') + ' до блокировки';
        }
    }
}

// Склонение слов
function getNoun(number, one, two, five) {
    number = Math.abs(number);
    number %= 100;
    if (number >= 5 && number <= 20) {
        return five;
    }
    number %= 10;
    if (number === 1) {
        return one;
    }
    if (number >= 2 && number <= 4) {
        return two;
    }
    return five;
}


// Окно подсказок к поиску
const searchField = document.querySelectorAll('.j-search__field');
for(let i=0; i<searchField?.length; i++) {
    searchField[i].addEventListener('click',()=>{
        if(!searchField[i].closest('.search').classList.contains('active')) {
            searchField[i].closest('.search').querySelector('.search__shadow').style.height = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ) + 'px';

            let list;
            searchField[i].closest('.search').classList.add('active');

            if(searchField[i].value.trim().length === 0) {
                searchField[i].closest('.search').classList.add('active--recent');
                list = searchField[i].closest('.search').querySelectorAll('.search__recent .search__list');
            } else {
                searchField[i].closest('.search').classList.add('active--hint');
                list = searchField[i].closest('.search').querySelectorAll('.search__hint .search__list');
            }

            checkListHeight(list);
            controlListShadow(list)
        }
    });

    searchField[i].addEventListener('input',()=>{
        let list;

        if(searchField[i].value.trim().length > 2) {
            searchField[i].closest('.search').classList.add('active--hint');
            searchField[i].closest('.search').classList.remove('active--recent');
            list = searchField[i].closest('.search').querySelectorAll('.search__hint .search__list');
        } else {
            searchField[i].closest('.search').classList.remove('active--hint');
            searchField[i].closest('.search').classList.add('active--recent');
            list = searchField[i].closest('.search').querySelectorAll('.search__recent .search__list');
        }

        checkListHeight(list);
        controlListShadow(list);
    });

    const searchCloseButton = searchField[i].closest('.search__form').querySelector('.j-search__close');
    searchCloseButton?.addEventListener('click',(e)=>{
        e.preventDefault();
        closeSearchWindow(searchField[i]);
    });

    const searchWindowShadow = searchField[i].closest('.search').querySelector('.search__shadow');
    searchWindowShadow?.addEventListener('click',()=>{
        closeSearchWindow(searchField[i]);
    });

    const searchItem = searchField[i].closest('.search').querySelectorAll('.search_item');
    for(let k=0; k<searchItem.length; k++) {
        searchItem[k].addEventListener('click',()=>{
            searchField[i].value = searchItem[k].querySelector('.search_item__name').innerText;
            searchField[i].closest('.search').querySelector('.j-search__button').click();
        });
    }
}


// Закрытие окна поиска
function closeSearchWindow(searchField) {
    searchField.value = "";
    searchField.closest('.search').classList.remove('active');
    searchField.closest('.search').classList.remove('active--hint');
    searchField.closest('.search').classList.remove('active--recent');

    searchField.closest('.search').querySelector('.search__shadow').style.height = '';
}


// Поле поиска в фильтрах
function initSearchField() {
    let searchField = document.querySelectorAll('.filter__search .search__field');
    for(let i=0; i<searchField?.length; i++) {
        searchField[i].addEventListener('keyup',()=>{
            let searchFieldValue = searchField[i].value;
            let filterItem = searchField[i].closest('.filter__wrap').querySelectorAll('.filter__item .checkbox__box');
            for(let k=0; k<filterItem?.length; k++) {
                let filterItemValue = filterItem[k].innerText;
                if(filterItemValue.toLowerCase().indexOf(searchFieldValue.toLowerCase()) > -1) {
                    filterItem[k].closest('.filter__item').style.display = '';
                } else {
                    filterItem[k].closest('.filter__item').style.display = 'none';
                }
            }
            // Проверяем необходимость дымки в списке
            checkListHeight(searchField[i].closest('.filter__wrap').querySelectorAll('.filter__list'))
            // Если ничего не найдено, показываем текстовую подсказку
            let visibleItems = 0;
            for(let k=0; k<filterItem?.length; k++) {
                if(getComputedStyle(filterItem[k].closest('.filter__item')).display !== 'none') {
                    visibleItems++;
                }
            }
            if(visibleItems === 0) {
                if(searchField[i].closest('.filter__wrap').querySelectorAll('.filter__not-found').length === 0) {
                    let hint = document.createElement('p');
                    hint.classList.add('filter__not-found');
                    hint.innerText = "Ничего не найдено"
                    searchField[i].closest('.filter__wrap').querySelector('.filter__search').after(hint);
                }
            } else {
                searchField[i].closest('.filter__wrap').querySelector('.filter__not-found')?.remove();
            }
        });
        searchField[i].addEventListener('change',()=>{
            let searchFieldValue = searchField[i].value;
            let filterItem = searchField[i].closest('.filter__wrap').querySelectorAll('.filter__item .checkbox__box');
            for(let k=0; k<filterItem?.length; k++) {
                let filterItemValue = filterItem[k].innerText;
                if(filterItemValue.toLowerCase().indexOf(searchFieldValue.toLowerCase()) > -1) {
                    filterItem[k].closest('.filter__item').style.display = '';
                } else {
                    filterItem[k].closest('.filter__item').style.display = 'none';
                }
            }
            // Проверяем необходимость дымки в списке
            checkListHeight(searchField[i].closest('.filter__wrap').querySelectorAll('.filter__list'))
            // Если ничего не найдено, показываем текстовую подсказку
            let visibleItems = 0;
            for(let k=0; k<filterItem?.length; k++) {
                if(getComputedStyle(filterItem[k].closest('.filter__item')).display !== 'none') {
                    visibleItems++;
                }
            }
            if(visibleItems === 0) {
                if(searchField[i].closest('.filter__wrap').querySelectorAll('.filter__not-found').length === 0) {
                    let hint = document.createElement('p');
                    hint.classList.add('filter__not-found');
                    hint.innerText = "Ничего не найдено"
                    searchField[i].closest('.filter__wrap').querySelector('.filter__search').after(hint);
                }
            } else {
                searchField[i].closest('.filter__wrap').querySelector('.filter__not-found')?.remove();
            }
        });
    }
}
initSearchField();


// Выпадающие списки. Добавляем дымку, если список длинный
function checkListHeight(list) {
    for(let i=0; i<list.length; i++) {
        const listGroup = list[i].querySelector('.list__group');
        const listInner = list[i].querySelector('.list__inner');
        if(listGroup.offsetHeight > listInner.offsetHeight) {
            listInner.classList.add('hidden');
        } else {
            listInner.classList.remove('hidden');
        }
    }
}


// Выпадающие списки. Убираем дымку при прокрутке списка до конца
function controlListShadow(list) {
    for(let i=0; i<list.length; i++) {
        const listInner = list[i].querySelector('.list__inner');
        listInner.addEventListener('scroll', () => {
            const scrollTopInner = Math.round(listInner.scrollTop);
            const scrollTopGroup = Math.round(listInner.querySelector('.list__group').offsetHeight - listInner.offsetHeight);
            if (Math.abs(scrollTopInner - scrollTopGroup) <= 3) {
                listInner.classList.add('scroll-to-end');
            } else {
                listInner.classList.remove('scroll-to-end');
            }
        });
    }
}


// Меню. Открыть/закрыть
const menuButton = document.querySelector('.j-open-menu');
const menuPopup = document.querySelector('.popup_menu');
menuButton?.addEventListener('click',()=>{
    if(menuButton.classList.contains('active')) {
        menuButton.classList.remove('active');
        menuPopup.classList.remove('active');
        if(menuPopup.classList.contains('popup_menu--sublevel')) {
            menuPopup.querySelector('.j-popup_menu__back').click();
        }
        document.body.style.position = '';
    } else {
        menuButton.classList.add('active');
        menuPopup.classList.add('active');
        document.body.style.position = 'fixed';
    }
});


// Меню. Подставить кнопки в пункты с вложенными списками
if(menuPopup) {
    const menuBack = menuPopup.querySelector('.j-popup_menu__back');
    menuBack.addEventListener('click',()=>{
        menuPopup.classList.remove('popup_menu--sublevel');

        for(let i=0; i<menuPopup.querySelectorAll('.popup_menu__block').length; i++) {
            if(menuPopup.querySelectorAll('.popup_menu__block')[i].classList.contains('popup_menu__block--active')) {
                menuPopup.querySelectorAll('.popup_menu__block')[i].classList.remove('popup_menu__block--active')
            }
        }

        for(let i=0; i<menuItems.length; i++) {
            if(menuItems[i].classList.contains('active')) {
                menuItems[i].classList.remove('active');
            }
        }
    });

    const menuItems = menuPopup.querySelectorAll('.popup_menu__item');
    for(let i=0; i<menuItems.length; i++) {
        if(menuItems[i].querySelectorAll('ul').length > 0) {
            menuItems[i].classList.add('popup_menu__item--list');
        }

        for(let l=0; l<menuItems[i].children.length; l++) {
            if(menuItems[i].children[l].tagName === 'SPAN') {
                menuItems[i].children[l].addEventListener('click',()=> {
                    menuItems[i].classList.add('active');
                    menuPopup.classList.add('popup_menu--sublevel');
                    menuItems[i].closest('.popup_menu__block').classList.add('popup_menu__block--active')
                });
            }
        }
    }
}


// Сортировка в таблице
const sortTableButton = document.querySelectorAll('.j-cell-sort');
for(let i=0; i<sortTableButton?.length; i++) {
    sortTableButton[i].addEventListener('click',()=>{
        if(sortTableButton[i].classList.contains('sort-active-down')) {
            sortTableButton[i].classList.remove('sort-active-down');
            sortTableButton[i].classList.add('sort-active-up');
        } else if(sortTableButton[i].classList.contains('sort-active-up')) {
            sortTableButton[i].classList.remove('sort-active-up');
        } else {
            sortTableButton[i].classList.add('sort-active-down');
        }
    });
}


// Открыть/скрыть фильтр в таблице
const filterTableButton = document.querySelectorAll('.j-open-filter');
for(let i=0; i<filterTableButton?.length; i++) {
    filterTableButton[i].addEventListener('click',()=>{
        if(filterTableButton[i].closest('.table__cell').classList.contains('cell--filter-open')) {
            filterTableButton[i].closest('.table__cell').classList.remove('cell--filter-open');
        } else {
            filterTableButton[i].closest('.table__cell').classList.add('cell--filter-open');

            checkListHeight(filterTableButton[i].closest('.table__cell').querySelectorAll('.filter__list'));
            controlListShadow(filterTableButton[i].closest('.table__cell').querySelectorAll('.filter__list'))
        }
    });
}


// Выбор в фильтре
const checkboxInFilter = document.querySelectorAll('.filter__checkbox .checkbox__field');
for(let i=0; i<checkboxInFilter?.length; i++) {
    checkboxInFilter[i].addEventListener('change',()=>{
        if(checkboxInFilter[i].classList.contains('checkbox__field--all')) {
            // Клик по "Выделить все"
            let boxChecked = checkboxInFilter[i].checked ? true : false;
            const checkbox = checkboxInFilter[i].closest('.filter__list').querySelectorAll('.checkbox__field');
            for(let l=0; l<checkbox.length; l++) {
                checkbox[l].checked = boxChecked;
            }
        } else if (!checkboxInFilter[i].checked) {
            checkboxInFilter[i].closest('.filter__list').querySelector('.checkbox__field--all').checked = false;
        }

        // Проверка необходимости отображения "Сбросить фильтры"
        if(checkFilter(checkboxInFilter[i].closest('.table__cell').querySelectorAll('.filter__list'))) {
            checkboxInFilter[i].closest('.table__cell').querySelector('.j-filter-clear').classList.add('filter-clear--active');
        } else {
            checkboxInFilter[i].closest('.table__cell').querySelector('.j-filter-clear').classList.remove('filter-clear--active');
        }
    });
}

// Проверка отмеченных чекбоксов в фильтре
function checkFilter(filter) {
    let filterApply = false;
    for(let i=0; i<filter.length; i++) {
        const filterItem = filter[i].querySelectorAll('.checkbox__field');
        for(let i=0; i<filterItem.length; i++) {
            if(filterItem[i].checked) {
                filterApply = true;
            }
        }
    }
    return(filterApply);
}


// Применить фильтр в таблице
const filterApplyButton = document.querySelectorAll('.j-filter-apply');
for(let i=0; i<filterApplyButton?.length; i++) {
    filterApplyButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        filterApplyButton[i].closest('.table__cell').classList.remove('cell--filter-open');

        filterGetOptions(filterApplyButton[i].closest('.filter'));

        if(checkFilter(filterApplyButton[i].closest('.table__cell').querySelectorAll('.filter__list'))) {
            filterApplyButton[i].closest('.table__cell').classList.add('cell--filter-active');
        } else {
            filterApplyButton[i].closest('.table__cell').classList.remove('cell--filter-active');
        }
    });
}


// Запомнить все выбранные значения в фильтре
function filterGetOptions(filter) {
    if(filter.querySelectorAll('.filter__wrap').length > 0) {
        let filterBlock = filter.querySelectorAll('.filter__wrap');
        for(let k=0; k<filterBlock?.length; k++) {
            let filterType;
            let filterValue = '';
            const filterItems = filterBlock[k].querySelectorAll('.filter__item');
            for(let i=0; i<filterItems?.length; i++) {
                if(filterItems[i].querySelector('.checkbox__field').checked &&
                    !filterItems[i].querySelector('.checkbox__field').classList.contains('checkbox__field--all')) {
                    filterType = filterItems[i].querySelector('.checkbox__field').getAttribute('name').toLowerCase();
                    filterValue = filterValue.length > 0 ?
                        filterValue + '[' + filterItems[i].querySelector('.checkbox__text').innerText + ']':
                        '[' + filterItems[i].querySelector('.checkbox__text').innerText + ']';
                }
            }
            if(filterType) {
                filter.setAttribute('data-' + filterType, filterValue);
            }
        }
    } else {
        let filterType;
        let filterValue = '';
        const filterItems = filter.querySelectorAll('.filter__item');
        for(let i=0; i<filterItems?.length; i++) {
            if(filterItems[i].querySelector('.checkbox__field').checked &&
                !filterItems[i].querySelector('.checkbox__field').classList.contains('checkbox__field--all')) {
                filterType = filterItems[i].querySelector('.checkbox__field').getAttribute('name').toLowerCase();
                filterValue = filterValue.length > 0 ?
                    filterValue + '[' + filterItems[i].querySelector('.checkbox__text').innerText + ']':
                    '[' + filterItems[i].querySelector('.checkbox__text').innerText + ']';
            }
        }
        if(filterType) {
            filter.setAttribute('data-' + filterType, filterValue);
        }
    }
}


// Отменить фильтр в таблице
const filterCancelButton = document.querySelectorAll('.j-filter-cancel');
for(let i=0; i<filterCancelButton?.length; i++) {
    filterCancelButton[i].addEventListener('click',(e)=>{
        e.preventDefault();

        let filterItems = filterCancelButton[i].closest('.filter').querySelectorAll('.filter__item');
        for(let k=0; k<filterItems?.length; k++) {
            let filterItemName = filterItems[k].querySelector('.checkbox__field').getAttribute('name').toLowerCase();
            let filterItemValue = filterItems[k].querySelector('.checkbox__text').innerText;
            if(filterCancelButton[i].closest('.filter').hasAttribute('data-' + filterItemName) &&
                filterCancelButton[i].closest('.filter').getAttribute('data-' + filterItemName).indexOf('[' + filterItemValue + ']') > -1) {
                filterItems[k].querySelector('.checkbox__field').checked = true;
            } else {
                filterItems[k].querySelector('.checkbox__field').checked = false;
            }
        }

        filterCancelButton[i].closest('.table__cell').classList.remove('cell--filter-open');
    });
}


// Сбросить конкретный фильтр
const filterClearButton = document.querySelectorAll('.j-filter-clear');
for(let i=0; i<filterClearButton?.length; i++) {
    filterClearButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        const filterItem = filterClearButton[i].closest('.table__cell').querySelectorAll('.checkbox__field');
        for(let k=0; k<filterItem.length; k++) {
            filterItem[k].checked = false;
        }

        let filter = filterClearButton[i].closest('.filter');
        if(filter.querySelectorAll('.filter__wrap').length > 0) {
            let filterWrap = filter.querySelectorAll('.filter__wrap');
            for(let l=0; l<filterWrap?.length; l++) {
                let filterType = filterWrap[l].querySelector('.filter__item input').getAttribute('name').toLowerCase();
                if(filter.hasAttribute('data-' + filterType)) {
                    filter.removeAttribute('data-' + filterType);
                }
            }
        } else {
            let filterType = filterClearButton[i].closest('.filter').querySelector('.filter__item input').getAttribute('name').toLowerCase();
            if(filter.hasAttribute('data-' + filterType)) {
                filter.removeAttribute('data-' + filterType);
            }
        }

        filterClearButton[i].classList.remove('filter-clear--active');
        filterClearButton[i].closest('.filter_buttons').querySelector('.j-filter-apply').click();
    });
}


// Сбросить все фильтры
const filterClear = document.querySelector('.j-clear-filter');
filterClear?.addEventListener('click',()=>{
    const filterActive = document.querySelectorAll('.cell--filter-active');
    for(let i=0; i<filterActive.length; i++) {
        filterActive[i].querySelector('.j-filter-clear').click();
    }
});


// Открыть/скрыть выпадающие списки
if(document.documentElement.clientWidth > 1239) {
    const dropdownButton = document.querySelectorAll('.dropdown__button');
    for(let i=0; i<dropdownButton?.length; i++) {
        dropdownButton[i].addEventListener('click',()=>{
            let dropdown = dropdownButton[i].closest('.dropdown');

            if(dropdownButton[i].classList.contains('dropdown__button--disabled')) {
                return;
            }

            if(dropdownButton[i].classList.contains('dropdown__button--warning')) {
                dropdownButton[i].classList.remove('dropdown__button--warning');
            }

            if(dropdown.classList.contains('dropdown--active')) {
                dropdown.classList.remove('dropdown--active');
            } else {
                dropdown.classList.add('dropdown--active');

                checkListHeight(dropdown.querySelectorAll('.dropdown__list'));
                controlListShadow(dropdown.querySelectorAll('.dropdown__list'))
            }
        });
    }
} else {
    const dropdownSelect = document.querySelectorAll('.dropdown__select');
    for(let i=0; i<dropdownSelect?.length; i++) {
        dropdownSelect[i].addEventListener('change',()=>{
            if(dropdownSelect[i].closest('.dropdown__button').classList.contains('dropdown__button--warning')) {
                dropdownSelect[i].closest('.dropdown__button').classList.remove('dropdown__button--warning');
            }
            if(dropdownSelect[i].value === "Не выбран" || dropdownSelect[i].value === "Не выбрано") {
                dropdownSelect[i].closest('.dropdown__button').classList.add('dropdown__button--grey');
            } else {
                dropdownSelect[i].closest('.dropdown__button').classList.remove('dropdown__button--grey');
            }
            checkSelectVisibility(dropdownSelect[i].closest('.panel__form').querySelectorAll('.dropdown__select'));
        });
    }
}


// Выбор в выпадающем списке
const dropdownItem = document.querySelectorAll('.dropdown__checkbox .checkbox__field');
for(let i=0; i<dropdownItem?.length; i++) {
    dropdownItem[i].addEventListener('change',()=>{
        dropdownItem[i].closest('.dropdown').querySelector('.dropdown__text').innerHTML = dropdownItem[i].closest('.dropdown__item').querySelector('.checkbox__box').innerHTML;
        if(dropdownItem[i].classList.contains('checkbox__field--grey')) {
            dropdownItem[i].closest('.dropdown').querySelector('.dropdown__button').classList.add('dropdown__button--grey');
        } else {
            dropdownItem[i].closest('.dropdown').querySelector('.dropdown__button').classList.remove('dropdown__button--grey');
        }

        if(dropdownItem[i].closest('.order')?.classList.contains('order--confirmed') &&
            dropdownItem[i].closest('.order')?.querySelector('.j-order-edit').getAttribute('disabled')) {
            dropdownItem[i].closest('.order').querySelector('.j-order-edit').removeAttribute('disabled');
        }

        dropdownItem[i].closest('.dropdown').classList.remove('dropdown--active');

        if(dropdownItem[i].closest('.dropdown').classList.contains('cell__dropdown')) {
            checkDropdownVisibility();
            checkReadinessToConfirm();
        } else if(dropdownItem[i].closest('.dropdown').classList.contains('panel__dropdown')) {
            checkDropdownVisibilityInPanel(dropdownItem[i].closest('.panel__fields').querySelectorAll('.dropdown'));
        } else if(dropdownItem[i].closest('.dropdown').classList.contains('bill__dropdown')) {
            checkDropdownVisibilityInPanel(dropdownItem[i].closest('.bill__fields').querySelectorAll('.dropdown'));
        }

    });
}


// Скрыть/показать нужные выпадающие списки
function checkDropdownVisibility() {
    const block = document.querySelectorAll('.page__table .order');
    for(let i=0; i<block?.length; i++) {
        const blockDropdown = document.documentElement.clientWidth > 1199 ? block[i].querySelectorAll('.order__inner .dropdown') : block[i].querySelectorAll('.order__window .dropdown');
        for(let k=0; k<(blockDropdown?.length-1); k++) {
            if(blockDropdown[k].querySelector('.dropdown__button').classList.contains('dropdown__button--grey')) {
                blockDropdown[k+1].classList.add('dropdown--hidden');
                blockDropdown[k+1].querySelector('.checkbox__field--grey').click();
            } else {
                blockDropdown[k+1].classList.remove('dropdown--hidden');
            }
        }
    }
}


// Скрыть/показать нужные выпадающие списки в фиксированной панели
function checkDropdownVisibilityInPanel(dropdowns) {
    for(let i=0; i<(dropdowns?.length-1); i++) {
        if(dropdowns[i].querySelector('.dropdown__button').classList.contains('dropdown__button--grey')) {
            dropdowns[i+1].querySelector('.dropdown__button').classList.add('dropdown__button--disabled');
            dropdowns[i+1].querySelector('.dropdown__button').classList.add('dropdown__button--grey');
            for(let k=0; k<dropdowns[i+1].querySelectorAll('.checkbox__field').length; k++) {
                if(dropdowns[i+1].querySelectorAll('.checkbox__field')[k].checked) {
                    dropdowns[i+1].querySelectorAll('.checkbox__field')[k].checked = false;
                }
            }
            dropdowns[i+1].querySelector('.dropdown__text').innerText = dropdowns[i+1].querySelector('.dropdown__button').getAttribute('data-placeholder');
        } else {
            dropdowns[i+1].querySelector('.dropdown__button').classList.remove('dropdown__button--disabled');
        }
    }
}


// Скрыть/показать нужные выпадающие списки на адаптиве
function checkSelectVisibility(dropdowns) {
    for(let i=0; i<(dropdowns?.length-1); i++) {
        if(dropdowns[i].closest('.dropdown__button').classList.contains('dropdown__button--grey')) {
            dropdowns[i+1].closest('.dropdown__button').classList.add('dropdown__button--disabled');
            dropdowns[i+1].closest('.dropdown__button').classList.add('dropdown__button--grey');
            dropdowns[i+1].value = dropdowns[i+1].options[1].innerText;
            dropdowns[i+1].setAttribute('disabled',true);
        } else {
            dropdowns[i+1].closest('.dropdown__button').classList.remove('dropdown__button--disabled');
            dropdowns[i+1].removeAttribute('disabled');
        }
    }
}


// Проверка возможности подтвердить заказ
function checkReadinessToConfirm() {
    const block = document.querySelectorAll('.page__table .order');
    for(let i=0; i<block?.length; i++) {
        const blockDropdown = document.documentElement.clientWidth > 1199 ? block[i].querySelectorAll('.order__inner .dropdown') : block[i].querySelectorAll('.order__window .dropdown');
        for(let k=0; k<blockDropdown?.length; k++) {
            if(blockDropdown[k].querySelector('.dropdown__button').classList.contains('dropdown__button--grey')) {
                block[i].querySelector('.j-order-confirm').setAttribute('disabled',true);
            } else {
                block[i].querySelector('.j-order-confirm').removeAttribute('disabled');
            }
        }
    }
}


// Изменить заказ
const orderEditButton = document.querySelectorAll('.j-order-edit');
for(let i=0; i<orderEditButton?.length; i++) {
    orderEditButton[i].addEventListener('click',()=>{
        const orderBlock = orderEditButton[i].closest('.order').querySelectorAll('.dropdown');
        for(let k=0; k<orderBlock.length; k++) {
            if(orderBlock[k].querySelector('.dropdown__button').classList.contains('dropdown__button--grey')) {
                orderEditButton[i].closest('.order').classList.remove('order--confirmed');
            }
        }
        orderEditButton[i].setAttribute('disabled', true);
    });
}


// Подтвердить заказ
const orderConfirmButton = document.querySelectorAll('.j-order-confirm');
const wrapperShadow = document.querySelector('.wrapper__shadow');
for(let i=0; i<orderConfirmButton?.length; i++) {
    orderConfirmButton[i].addEventListener('click',()=>{
        orderConfirmButton[i].closest('.order').classList.add('order--confirming');
        wrapperShadow.classList.add('wrapper__shadow--active');
        document.querySelector('.popup--confirmation').classList.add('popup--active');

        setTimeout(()=>{
            checkListHeight(document.querySelectorAll('.popup--confirmation .order__list'));
            controlListShadow(document.querySelectorAll('.popup--confirmation .order__list'));
        }, 10);
    });
}


// Подтвердить заказ из фиксированной панели
const ordersConfirmButton = document.querySelectorAll('.j-orders-confirm');
for(let l=0; l<ordersConfirmButton?.length; l++) {
    ordersConfirmButton[l].addEventListener('click',(e)=>{
        e.preventDefault();
        const ordersParameters = ordersConfirmButton[l].closest('.panel__form').querySelectorAll('.dropdown__button');
        let readyToConfirm = true;
        for(let i=0; i<ordersParameters.length; i++) {
            if(ordersParameters[i].classList.contains('dropdown__button--grey')) {
                ordersParameters[i].classList.add('dropdown__button--warning');
                readyToConfirm = false;
            }
        }
        if(readyToConfirm) {
            if(document.documentElement.clientWidth > 1239) {
                const orderCheckbox = document.querySelectorAll('.table__body .cell__checkbox .checkbox__field');
                let checkedCount = 0;
                for(let k=0; k<orderCheckbox.length; k++) {
                    if(orderCheckbox[k].checked) {
                        orderCheckbox[k].closest('.order').classList.add('order--confirming');
                        checkedCount++;
                    }
                }
                if(checkedCount > 1) {
                    document.querySelector('.popup--confirmation').classList.add('popup--confirmation-multiple');
                }

                setTimeout(()=>{
                    checkListHeight(document.querySelectorAll('.popup--confirmation .order__list'));
                    controlListShadow(document.querySelectorAll('.popup--confirmation .order__list'));
                }, 10);
            } else {
                ordersConfirmButton[l].closest('.order').classList.add('order--confirming');
            }

            wrapperShadow.classList.add('wrapper__shadow--active');
            document.querySelector('.popup--confirmation').classList.add('popup--active');

            document.querySelector('.j-panel-close').click();
        }
    });
}


// Отмена подтверждения заказа
const confirmationCancel = document.querySelector('.j-confirm-cancel');
confirmationCancel?.addEventListener('click',()=>{
    confirmationCancel.closest('.popup').classList.remove('popup--active');
    confirmationCancel.closest('.popup').classList.remove('popup--confirmation-multiple');
    wrapperShadow.classList.remove('wrapper__shadow--active');
    document.querySelector('.order--confirming').classList.remove('order--confirming');
});


// Подтверждение подтверждения заказа
const confirmationConfirm = document.querySelector('.j-confirm-order');
confirmationConfirm?.addEventListener('click',()=>{
    confirmationConfirm.closest('.popup').classList.remove('popup--active');
    confirmationConfirm.closest('.popup').classList.remove('popup--confirmation-multiple');
    wrapperShadow.classList.remove('wrapper__shadow--active');

    const orders = document.querySelectorAll('.page__table .order');
    for(let i=0; i<orders.length; i++) {
        if(orders[i].classList.contains('order--confirming')) {
            orders[i].classList.add('order--confirmed');
            orders[i].classList.remove('order--confirming');
        }
    }
});


//Закрытие окон по клику вне окон
wrapperShadow?.addEventListener('click',()=>{
    popupClose();
});


// Закрытие окон по клику на крестик
const popupCloseButton = document.querySelectorAll('.popup__close');
for(let i=0; i<popupCloseButton?.length; i++) {
    popupCloseButton[i].addEventListener('click',()=>{
        popupClose();
    });
}


// Закрытие окон
function popupClose() {
    if(document.querySelector('.popup--active')?.classList.contains('popup--confirmation')) {
        document.querySelector('.popup--confirmation').classList.remove('popup--confirmation-multiple');
        const orders = document.querySelectorAll('.page__table .order');
        for(let i=0; i<orders.length; i++) {
            if(orders[i].classList.contains('order--confirming')) {
                orders[i].classList.remove('order--confirming');
            }
        }
    } else if(document.querySelector('.popup--active')?.classList.contains('popup--bill')) {
        resetBill(document.querySelector('.popup--bill'))
    } else if(document.querySelector('.popup--active')?.classList.contains('popup--call')) {
        clearPopup(document.querySelector('.popup--call'))
    } else if(document.querySelector('.comment--active')) {
        closeComment(document.querySelector('.comment--active'));
    }
    document.querySelector('.popup--active')?.classList.remove('popup--active');
    wrapperShadow.classList.remove('wrapper__shadow--active');
}


document.addEventListener('mouseup',(e)=>{
    // Закрытие фильтров по клику вне фильтра
    if(document.querySelectorAll('.cell--filter-open')?.length > 0 &&
        document.querySelector('.cell--filter-open') !== e.target &&
        !document.querySelector('.cell--filter-open')?.contains(e.target)) {
        document.querySelector('.cell--filter-open .j-filter-cancel')?.click();
    }

    // Закрытие выпадающих списков по клику вне списков
    if(document.querySelectorAll('.dropdown--active')?.length > 0 &&
        document.querySelector('.dropdown--active') !== e.target &&
        !document.querySelector('.dropdown--active')?.contains(e.target)) {
        document.querySelector('.dropdown--active')?.classList.remove('dropdown--active');
    }
});


// Открыть комментарий
const commentOpenButton = document.querySelectorAll('.j-order-comment');
for(let i=0; i<commentOpenButton?.length; i++) {
    commentOpenButton[i].addEventListener('click',()=>{
        const commentWrap = commentOpenButton[i].closest('.comment');
        if(document.documentElement.clientWidth > 1239 || (document.documentElement.clientWidth > 767 && document.querySelector('.page').classList.contains('page--order-favorite'))) {
            if(commentWrap.classList.contains('comment--max')) {
                commentWrap.classList.remove('comment--max');
            }
            if(commentWrap.classList.contains('comment--has-comment')) {
                commentWrap.querySelector('.comment__field').value = commentWrap.querySelector('.hint__inner').innerText;
                if(document.documentElement.clientWidth > 1239) {
                    commentWrap.querySelector('.comment__field').style.height = '1px';
                    setTimeout(()=>{
                        commentWrap.querySelector('.comment__field').style.height = commentWrap.querySelector('.comment__field').scrollHeight + 'px';
                        if(commentWrap.querySelector('.comment__field').scrollHeight > 30) {
                            commentWrap.querySelector('.comment__field_wrap').style.borderBottomRightRadius = '5px';
                        } else {
                            commentWrap.querySelector('.comment__field_wrap').style.borderBottomRightRadius = '';
                        }
                    }, 50);
                }
            }
        } else {
            commentWrap.setAttribute('data-scrollTop', window.pageYOffset);

            if(commentWrap.classList.contains('comment--has-comment')) {
                commentWrap.querySelector('.comment__field').value = commentWrap.querySelector('.comment__message').innerText;
            }
        }

        commentWrap.classList.add('comment--active');
        if(document.documentElement.clientWidth > 1239) {
            commentWrap.querySelector('.comment__field').focus();
            if(document.querySelector('.page').classList.contains('page--order-favorite') || document.querySelector('.page').classList.contains('page--order-active')) {
                commentWrap.previousElementSibling.style.transition = 'none';
                commentWrap.previousElementSibling.style.backgroundColor = 'transparent';
            }
        }
    });
}


// Закрытие окна комментария по клику вне этого окна
const commentShadow = document.querySelectorAll('.comment__shadow');
for(let i=0; i<commentShadow?.length; i++) {
    commentShadow[i].addEventListener('click',()=>{
        closeComment(commentShadow[i].closest('.comment'));
    });
}


// Отмена комментария
const commentCancel = document.querySelectorAll('.j-comment-cancel');
for(let i=0; i<commentCancel?.length; i++) {
    commentCancel[i].addEventListener('click',(e)=>{
        e.preventDefault();
        closeComment(commentCancel[i].closest('.comment'));
    });
}


// Сохранить комментарий
const commentSave = document.querySelectorAll('.j-comment-save');
for(let i=0; i<commentSave?.length; i++) {
    commentSave[i].addEventListener('click',(e)=>{
        e.preventDefault();
        const commentWrap = commentSave[i].closest('.comment');
        const comment = commentWrap.querySelector('.comment__field');
        if(comment.value.trim().length > 0) {
            commentWrap.classList.add('comment--has-comment');
            if(document.documentElement.clientWidth > 1239 || (document.documentElement.clientWidth > 767 && document.querySelector('.page').classList.contains('page--order-favorite'))) {
                commentWrap.querySelector('.hint__inner').innerText = comment.value;
                setTimeout(()=>{
                    if(commentWrap.querySelector('.cell__hint').offsetWidth > 180) {
                        commentWrap.classList.add('comment--max');
                    }
                }, 50);
            } else {
                commentWrap.querySelector('.comment__message').innerText = comment.value;
            }
        } else {
            commentWrap.classList.remove('comment--has-comment');
            if(document.documentElement.clientWidth > 1239 || (document.documentElement.clientWidth > 767 && document.querySelector('.page').classList.contains('page--order-favorite'))) {
                commentWrap.querySelector('.hint__inner').innerText = 'Комментарий';
            } else {
                commentWrap.querySelector('.comment__message').innerText = '';
            }
        }
        closeComment(commentSave[i].closest('.comment'));
    });
}


// Закрытие окна комментария
function closeComment(comment) {
    if(document.documentElement.clientWidth > 1239 || (document.documentElement.clientWidth > 767 && document.querySelector('.page').classList.contains('page--order-favorite'))) {
        setTimeout(()=>{
            if(comment.querySelector('.cell__hint').offsetWidth > 180) {
                comment.classList.add('comment--max');
            }
        }, 50);
    } else {
        if(window.pageYOffset !== comment.getAttribute('data-scrollTop')) {
            window.scrollTo(0, comment.getAttribute('data-scrollTop'));
        }
    }
    if(document.documentElement.clientWidth > 1239 && (document.querySelector('.page').classList.contains('page--order-favorite') || document.querySelector('.page').classList.contains('page--order-active'))) {
        comment.previousElementSibling.style.backgroundColor = '';
        setTimeout(()=>{
            comment.previousElementSibling.style.transition = '';
        }, 300);

    }
    comment.querySelector('.comment__field').value = '';
    comment.querySelector('.comment__field').style.height = '';
    comment.classList.remove('comment--active');
}


// Корректировка высоты поля комментария
if(document.documentElement.clientWidth > 1239) {
    const commentField = document.querySelectorAll('.comment__field');
    for(let i=0; i<commentField?.length; i++) {
        commentField[i].addEventListener('input',()=>{
            commentField[i].style.height = '1px';
            commentField[i].style.height = commentField[i].scrollHeight + 'px';

            if(commentField[i].scrollHeight > 30) {
                commentField[i].closest('.comment__field_wrap').style.borderBottomRightRadius = '5px';
            } else {
                commentField[i].closest('.comment__field_wrap').style.borderBottomRightRadius = '';
            }
        });
    }
}


// Открыть окно подтверждения удаления заказа
const deleteOpenButton = document.querySelectorAll('.j-order-delete');
for(let i=0; i<deleteOpenButton?.length; i++) {
    deleteOpenButton[i].addEventListener('click',()=>{
        const deleteWrap = deleteOpenButton[i].closest('.delete');
        deleteWrap.classList.add('delete--active');
    });
}


// Закрытие окна удаления заказа по клику вне этого окна
const deleteShadow = document.querySelectorAll('.delete__shadow');
for(let i=0; i<deleteShadow?.length; i++) {
    deleteShadow[i].addEventListener('click',()=>{
        document.querySelector('.delete--active').classList.remove('delete--active');
    });
}


// Отмена удаления заказа
const deleteCancel = document.querySelectorAll('.j-delete-cancel');
for(let i=0; i<deleteCancel?.length; i++) {
    deleteCancel[i].addEventListener('click',(e)=>{
        e.preventDefault();
        deleteCancel[i].closest('.delete').classList.remove('delete--active');
    });
}


// Подтвердить удаление заказа
const deleteConfirm = document.querySelectorAll('.j-delete-confirm');
for(let i=0; i<deleteConfirm?.length; i++) {
    deleteConfirm[i].addEventListener('click',(e)=>{
        e.preventDefault();
        deleteConfirm[i].closest('.order').remove();
    });
}


// Выделить заказы
const orderCheckbox = document.querySelectorAll('.cell--checkbox .checkbox__field');
for(let i=0; i<orderCheckbox?.length; i++) {
    orderCheckbox[i].addEventListener('change',()=>{
        if(orderCheckbox[i].classList.contains('checkbox__field--all')) {
            // Клик по "Выделить все"
            let boxChecked = orderCheckbox[i].checked ? true : false;
            for(let l=0; l<orderCheckbox[i].closest('.table').querySelectorAll('.cell--checkbox .checkbox__field').length; l++) {
                if(!orderCheckbox[i].closest('.table').querySelectorAll('.cell--checkbox .checkbox__field')[l].getAttribute('disabled')) {
                    orderCheckbox[i].closest('.table').querySelectorAll('.cell--checkbox .checkbox__field')[l].checked = boxChecked;
                }
            }
        } else if (!orderCheckbox[i].checked) {
            orderCheckbox[i].closest('.table').querySelector('.cell--checkbox .checkbox__field--all').checked = false;
        }
        if(checkPanel(orderCheckbox[i].closest('.table').querySelectorAll('.cell--checkbox .checkbox__field'))) {
            if(!document.querySelector('.popup--bill').classList.contains('popup--active')) {
                document.querySelector('.panel').classList.add('panel--active');
                checkSelectedOrdersSumm();
            }
            orderCheckbox[i].closest('.table').querySelector('.table__header .cell--checkbox .checkbox__field--all').removeAttribute('disabled');

            if(!orderCheckbox[i].classList.contains('checkbox__field--all')) {
                const stockCity = orderCheckbox[i].closest('.order').querySelector('.cell--stock .title').innerText;
                const orders = orderCheckbox[i].closest('.table').querySelectorAll('.order');
                for(let l=0; l<orders.length; l++) {
                    if(!orders[l].classList.contains('order--warning') && !orders[l].classList.contains('order--sent') && orders[l].querySelector('.cell--stock .title').innerText !== stockCity) {
                        orders[l].querySelector('.cell--checkbox .checkbox__field').setAttribute('disabled',true);
                    }
                }
            }
        } else {
            if(!document.querySelector('.popup--bill').classList.contains('popup--active')) {
                document.querySelector('.panel').classList.remove('panel--active');
            }

            for(let l=0; l<orderCheckbox.length; l++) {
                if(orderCheckbox[l].classList.contains('checkbox__field--all')) {
                    orderCheckbox[l].setAttribute('disabled', true);
                } else if(!orderCheckbox[l].closest('.order').classList.contains('order--warning')) {
                    orderCheckbox[l].removeAttribute('disabled');
                }
            }
        }
    });
}


// Подсчет значений выделенных заказов для фиксированной панели внизу
function checkSelectedOrdersSumm() {
    let checkedAmount = 0,
        checkedSumm = 0,
        checkedStock;
    const orders = document.querySelectorAll('.order');
    for(let i=0; i<orders?.length; i++) {
        if(orders[i].querySelector('.cell--checkbox input') && orders[i].querySelector('.cell--checkbox input').checked) {
            checkedAmount++;
            checkedSumm += +(orders[i].querySelector('.cell--summ .title').innerText.replace(' ₽','').replace(',','.').replace(' ',''));
            checkedStock = orders[i].querySelector('.cell--stock .title').innerText;
        }
    }
    document.querySelector('.panel .panel__summ').innerText = checkedAmount + ' наим. / ' + checkedSumm.toLocaleString(); + ' ₽';
    document.querySelector('.panel .panel__stock').innerText = 'Склад ' + checkedStock;
}


// Проверка отмеченных заказов в таблице
function checkPanel(checkbox) {
    let panelActive = false;
    for(let i=0; i<checkbox.length; i++) {
        if(checkbox[i].checked) {
            panelActive = true;
        }
    }
    return(panelActive);
}


// Закрыть фиксированную панель
const closePanelButton = document.querySelector('.j-panel-close');
closePanelButton?.addEventListener('click',()=>{
    for(let i=0; i<orderCheckbox.length; i++) {
        if(orderCheckbox[i].checked) {
            orderCheckbox[i].click();
        }
    }
    closePanelButton.closest('.panel').classList.remove('panel--active');
    resetPanel(closePanelButton.closest('.panel'));
});


// Очистка панели
function resetPanel(panel) {
    const panelParameters = panel.querySelectorAll('.dropdown');
    for(let i=0; i<panelParameters.length; i++) {
        if(panelParameters[i].classList.contains('panel__dropdown--partner')) {
            for(let k=0; k<panelParameters[i].querySelectorAll('.checkbox__field').length; k++) {
                if(panelParameters[i].querySelectorAll('.checkbox__field')[k].nextElementSibling.innerText == 'ООО Нодасофт') {
                    panelParameters[i].querySelectorAll('.checkbox__field')[k].click();
                }
            }
        } else {
            for(let k=0; k<panelParameters[i].querySelectorAll('.checkbox__field').length; k++) {
                if(panelParameters[i].querySelectorAll('.checkbox__field')[k].checked) {
                    panelParameters[i].querySelectorAll('.checkbox__field')[k].checked = false;
                    panelParameters[i].querySelector('.dropdown__button').classList.add('dropdown__button--grey');
                }
            }
            panelParameters[i].querySelector('.dropdown__text').innerText = panelParameters[i].querySelector('.dropdown__button').getAttribute('data-placeholder');
        }
    }
    checkDropdownVisibilityInPanel();
}


// Выставить счет
const billPopupOpenButton = document.querySelector('.j-make-bill');
billPopupOpenButton?.addEventListener('click',()=>{
    wrapperShadow.classList.add('wrapper__shadow--active');
    document.querySelector('.popup--bill').classList.add('popup--active');
    checkOrderName(document.querySelectorAll('.popup--bill .order__name'));

    checkListHeight(document.querySelectorAll('.popup--bill .table__wrap'));
    controlListShadow(document.querySelectorAll('.popup--bill .table__wrap'));
});


// Сформировать счет
const billConfirmButton = document.querySelector('.j-confirm-bill');
billConfirmButton?.addEventListener('click',(e)=>{
    e.preventDefault();
    let confirmReady = true;
    const billPopup = billConfirmButton.closest('.popup--bill');

    const billDropdown = billPopup.querySelectorAll('.bill__fields .dropdown');
    for(let i=0; i<billDropdown.length; i++) {
        if(billDropdown[i].querySelector('.dropdown__button').classList.contains('dropdown__button--grey') ||
            billDropdown[i].querySelector('.dropdown__button').classList.contains('dropdown__button--disabled')) {
            billDropdown[i].querySelector('.dropdown__button').classList.add('dropdown__button--warning');
            confirmReady = false;
        }
    }

    const billOrders = billPopup.querySelectorAll('.order');
    let notCheckedOrder = 0;
    for(let i=0; i<billOrders.length; i++) {
        if(!billOrders[i].querySelector('.cell--checkbox .checkbox__field').checked) {
            notCheckedOrder++;
        }
    }
    if(notCheckedOrder == billOrders.length) {
        confirmReady = false;
    }

    if(confirmReady) {
        wrapperShadow.classList.remove('wrapper__shadow--active');
        billPopup.classList.remove('popup--active');
        resetBill(billPopup);
    }
});


// Очистить окно выставления счета
function resetBill(billWindow) {
    const billParameters = billWindow.querySelectorAll('.bill__fields .dropdown');
    for(let i=0; i<billParameters.length; i++) {
        billParameters[i].querySelector('.dropdown__button').classList.remove('dropdown__button--warning');
        if(billParameters[i].classList.contains('bill__dropdown--partner')) {
            for(let k=0; k<billParameters[i].querySelectorAll('.checkbox__field').length; k++) {
                if(billParameters[i].querySelectorAll('.checkbox__field')[k].nextElementSibling.innerText == 'ООО Нодасофт') {
                    billParameters[i].querySelectorAll('.checkbox__field')[k].click();
                }
            }
        } else {
            for(let k=0; k<billParameters[i].querySelectorAll('.checkbox__field').length; k++) {
                if(billParameters[i].querySelectorAll('.checkbox__field')[k].checked) {
                    billParameters[i].querySelectorAll('.checkbox__field')[k].checked = false;
                    billParameters[i].querySelector('.dropdown__button').classList.add('dropdown__button--grey');
                }
            }
            billParameters[i].querySelector('.dropdown__text').innerText = billParameters[i].querySelector('.dropdown__button').getAttribute('data-placeholder');
        }
    }
    checkDropdownVisibilityInPanel();

    const billOrdersCheckbox = billWindow.querySelectorAll('.cell--checkbox .checkbox__field');
    for(let i=0; i<billOrdersCheckbox.length; i++) {
        billOrdersCheckbox[i].checked = false;
        if(billOrdersCheckbox[i].classList.contains('checkbox__field--all')) {
            billOrdersCheckbox[i].setAttribute('disabled', true);
        } else {
            billOrdersCheckbox[i].removeAttribute('disabled');
        }
    }
}


// Заявка на звонок
const openCallPopup = document.querySelectorAll('.j-order-call');
for(let i=0; i<openCallPopup?.length; i++) {
    openCallPopup[i].addEventListener('click',()=>{
        wrapperShadow.classList.add('wrapper__shadow--active');
        document.querySelector('.popup--call').classList.add('popup--active');
    });
}


// Отправить заявку на звонок
const sendRequestButton = document.querySelectorAll('.j-send-request');
for(let i=0; i<sendRequestButton?.length; i++) {
    sendRequestButton[i].addEventListener('click',(e)=>{
        e.preventDefault();
        let readyToSend = true;
        const popup = sendRequestButton[i].closest('.popup');
        const popupFields = popup.querySelectorAll('.field__input');
        for(let l=0; l<popupFields?.length; l++) {
            if(popupFields[l].getAttribute('required') && popupFields[l].value.trim().length === 0) {
                popupFields[l].closest('.field').classList.add('field--warning');
                readyToSend = false;
            }
            removeWarning(popupFields[l]);
        }
        if(readyToSend) {
            wrapperShadow.classList.remove('wrapper__shadow--active');
            popup.classList.remove('popup--active');
            clearPopup(popup);
        }
    });
}


// Снять выделение с полей
function removeWarning(field) {
    field.addEventListener('click',()=>{
        if(field.closest('.field').classList.contains('field--warning')) {
            field.closest('.field').classList.remove('field--warning');
        }
    });
}


// Очистить форму отправки заявки
function clearPopup(popup) {
    const popupFields = popup.querySelectorAll('.field__input');
    for(let l=0; l<popupFields?.length; l++) {
        popupFields[l].value = '';
    }
}


// Раскрыть/скрыть заказ
if(document.documentElement.clientWidth < 767 && document.querySelector('.page').classList.contains('page--order-favorite')) {
    initOrderInner();
} else if(document.documentElement.clientWidth < 1240 && !document.querySelector('.page').classList.contains('page--order-favorite')) {
    initOrderInner();
}
function initOrderInner() {
    const order = document.querySelectorAll('.order');
    for(let i=0; i<order?.length; i++) {
        order[i].addEventListener('click',(e)=>{
            let orderClick = true;
            if(order[i].querySelector('.order__window .delete') == e.target ||
                order[i].querySelector('.order__window .delete')?.contains(e.target) ||
                order[i].querySelector('.j-orders-confirm') == e.target ||
                order[i].querySelector('.j-orders-confirm')?.contains(e.target) ||
                order[i].querySelector('.order__window .order-to-item') == e.target ||
                order[i].querySelector('.order__window .order-to-item')?.contains(e.target)) {
                orderClick = false;
            }
            const orderDropdown = order[i].querySelectorAll('.order__window .dropdown');
            for(let k=0; k<orderDropdown?.length; k++) {
                if(orderDropdown[k] === e.target || orderDropdown[k].contains(e.target)) {
                    orderClick = false;
                }
            }
            const orderCommentChildren = order[i].querySelector('.order__window .comment').children;
            for(let k=0; k<orderCommentChildren?.length; k++) {
                if(orderCommentChildren[k] === e.target || orderCommentChildren[k].contains(e.target)) {
                    orderClick = false;
                }
            }

            if(orderClick) {
                if(order[i].classList.contains('order--open'))  {
                    order[i].classList.remove('order--open');
                } else {
                    order[i].classList.add('order--open');
                    checkOrderWindowPosition(order[i]);
                }
            }
        });
    }
}


// Проверка, умещается ли открытый заказ на странице
function checkOrderWindowPosition(order) {
    const windowShift = document.documentElement.clientHeight - order.getBoundingClientRect().bottom;
    if(windowShift < 0) {
        window.scrollBy(0, Math.abs(windowShift) + 10);
    }
}


// Добавляем подсказку при наведении на названия товаров, только если название не умещается
function checkOrderName( orderName = document.querySelectorAll('.order__name')) {
    for(let i=0; i<orderName?.length; i++) {
        if(orderName[i].querySelector('p').scrollWidth > orderName[i].querySelector('p').offsetWidth &&
            orderName[i].querySelectorAll('.hint').length === 0) {
            const hint = document.createElement('span');
            hint.className = 'cell__hint hint';
            hint.innerHTML = `<span className="hint__inner">${orderName[i].querySelector('p').innerText}</span>`;
            orderName[i].append(hint);
        } else {
            orderName[i].querySelector('.hint')?.remove();
        }
    }
}
if(document.documentElement.clientWidth > 1239) {
    checkOrderName();
}