import Shuffle from 'shufflejs'

'use strict';

// var Shuffle = window.Shuffle;

var Demo = function (element) {
  this.element = element;

  this.shuffle = new Shuffle(element, {
    itemSelector: '.card'
  });

  // Log events.
  this.addShuffleEventListeners();

  this._activeFilters = [];

  this.addFilterButtons();
  this.addSorting();
  this.addSearchFilter();

  this.mode = 'additive';
};

Demo.prototype.toggleMode = function () {
  if (this.mode === 'additive') {
    this.mode = 'exclusive';
  } else {
    this.mode = 'additive';
  }
};

/**
 * Shuffle uses the CustomEvent constructor to dispatch events. You can listen
 * for them like you normally would (with jQuery for example).
 */
Demo.prototype.addShuffleEventListeners = function () {
  this.shuffle.on(Shuffle.EventType.LAYOUT, function (data) {
    console.log('layout. data:', data);
  });

  this.shuffle.on(Shuffle.EventType.REMOVED, function (data) {
    console.log('removed. data:', data);
  });
};

Demo.prototype.addFilterButtons = function () {
  var options = document.querySelector('.filter-options');

  if (!options) {
    return;
  }

  var filterButtons = Array.from(options.children);

  filterButtons.forEach(function (button) {
    button.addEventListener('click', this._handleFilterClick.bind(this), false);
  }, this);
};

Demo.prototype._handleFilterClick = function (evt) {
  var btn = evt.currentTarget;
  var isActive = btn.classList.contains('active');
  var btnGroup = btn.getAttribute('data-group');
  var all = document.getElementById('all');

  // You don't need _both_ of these modes. This is only for the demo.
  // For this custom 'additive' mode in the demo, clicking on filter buttons
  // doesn't remove any other filters.
  if (this.mode === 'additive') {
    // If this button is already active, remove it from the list of filters.

    if (btn == all){
      this._removeActiveClassFromChildren(btn.parentNode);
      this._activeFilters = [];
      btn.classList.toggle('active');
      this.shuffle.filter(Shuffle.ALL_ITEMS);

    } else if (isActive) {
      //FIX: splice removes everything after the the index in array
      this._activeFilters.splice(this._activeFilters.indexOf(btnGroup), 1);
      if(this._activeFilters[0] == null) {
        all.classList.toggle('active');
      }
      btn.classList.toggle('active');

    } else {
      this._activeFilters.push(btnGroup);
      if(all.classList.contains('active')){
        all.classList.toggle('active');
      }
      btn.classList.toggle('active');
    }

    // Filter elements
    this.shuffle.filter(this._activeFilters);

  // 'exclusive' mode lets only one filter button be active at a time.
  } else {
    this._removeActiveClassFromChildren(btn.parentNode);

    var filterGroup;
    if (isActive) {
      btn.classList.remove('active');
      filterGroup = Shuffle.ALL_ITEMS;
    } else {
      btn.classList.add('active');
      filterGroup = btnGroup;
    }

    if(all.classList.contains('active')){
      all.classList.toggle('active');
    }
    
    this.shuffle.filter(filterGroup);
  }
};

Demo.prototype._removeActiveClassFromChildren = function (parent) {
  var children = parent.children;
  for (var i = children.length - 1; i >= 0; i--) {
    children[i].classList.remove('active');
  }
};

Demo.prototype.addSorting = function () {
  var buttonGroup = document.querySelector('.sort-options');

  if (!buttonGroup) {
    return;
  }

  buttonGroup.addEventListener('change', this._handleSortChange.bind(this));
};

Demo.prototype._handleSortChange = function (evt) {
  // Add and remove `active` class from buttons.
  var buttons = Array.from(evt.currentTarget.children);
  buttons.forEach(function (button) {
    if (button.querySelector('input').value === evt.target.value) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });

  // Create the sort options to give to Shuffle.
  var value = evt.target.value;
  var options = {};

  function sortByDate(element) {
    return element.getAttribute('data-created');
  }

  function sortByTitle(element) {
    return element.getAttribute('data-title').toLowerCase();
  }

  if (value === 'date-created') {
    options = {
      reverse: true,
      by: sortByDate,
    };
  } else if (value === 'title') {
    options = {
      by: sortByTitle,
    };
  }

  this.shuffle.sort(options);
};

// Advanced filtering
Demo.prototype.addSearchFilter = function () {
  var searchInput = document.querySelector('.js-shuffle-search');

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('keyup', this._handleSearchKeyup.bind(this));
};

/**
 * Filter the shuffle instance by items with a title that matches the search input.
 * @param {Event} evt Event object.
 */
Demo.prototype._handleSearchKeyup = function (evt) {
  var searchText = evt.target.value.toLowerCase();

  this.shuffle.filter(function (element, shuffle) {

    // If there is a current filter applied, ignore elements that don't match it.
    if (shuffle.group !== Shuffle.ALL_ITEMS) {
      // Get the item's groups.
      var groups = JSON.parse(element.getAttribute('data-groups'));
      var isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;

      // Only search elements in the current group
      if (!isElementInCurrentGroup) {
        return false;
      }
    }

    var titleElement = element.querySelector('.eventTitle')
    let titleText = titleElement.textContent
    cleanHighlight(titleElement, titleText)
    highlight(titleElement, searchText)
    titleText = titleText.toLowerCase().trim()

    var descElement = element.querySelector('.eventDescript')
    let descText = descElement.textContent
    cleanHighlight(descElement, descText)
    highlight(descElement, searchText)
    descText = descText.toLowerCase().trim()

    // portal search
    // var portElement = element.querySelector('.portTitles')
    // let portText = portElement.textContent
    // cleanHighlight(portElement, portText)
    // highlight(portElement, searchText)
    // portText = portText.toLowerCase().trim()

    // return (portText.indexOf(searchText) !== -1);

    return (titleText.indexOf(searchText) !== -1) || (descText.indexOf(searchText) !== -1);
  });
};

  const highlight = (element, text) => {
    let oldHtml = element.innerHTML
    var re = new RegExp(text,"ig");
    const newHtml = oldHtml.replace(re, (match) => `<span class="highlight">${match}</span>`)
    element.innerHTML = newHtml
  };

  const cleanHighlight = (element, text) => {
    // remove the old highlight before appying new one...
    console.log(text);
    text = text.replace('<span class="highlight">', '')
    text = text.replace('</span>', '')
    console.log(text);
    element.innerHTML = text
  };

// document.addEventListener('DOMContentLoaded', function () {
//     window.demo = new Demo(document.getElementById('grid'));
// });

export default Demo
