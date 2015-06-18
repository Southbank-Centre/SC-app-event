'use strict';

/**
 * @ngdoc controller
 * @name SC-app-event.controller:EventListCtrl
 * @controller
 *
 * @description
 * Defines the state and behaviour of the $scope for the eventListView state
 */

angular.module('SC-app-event')
  .controller('EventListCtrl', function ($rootScope, $scope, $stateParams, $location, eventFactory, utilitiesFactory, $filter, $window) {

    /**
     * Method for getting event list from the API
     */
    eventFactory.getEventList( function(data) {

      /**
       * Callback for infinite scroll mechanism.
       * Load the next set of events into the page
       * and store how many have been loaded
       */
      $scope.loadNextEvents = function() {

        var len = $scope.events.length;
        $scope.events.push.apply($scope.events, $scope.allEvents.list.slice(len, len + numToLoad));

      };

      /**
       * Sets the number of events loaded to just be the initial
       * numToLoad, so that infinite scrolling can be used
       * after filters are changed
       */
      $scope.resetEvents = function() {

        // If there are select box filters applied,
        // pass through all events
        if ($scope.filtersApplied()) {

          $scope.events = $scope.allEvents.list;

        // If not, pass through the first 20 because
        // infinite scroll will be in use
        } else {

          $scope.events = $scope.allEvents.list.slice(0, numToLoad);

        }

      };

      // Number of items to load each time
      // when infinite scroll point has been reached
      var numToLoad = 10;

      // Success
      // Attach the event data to the scope
      $scope.allEvents = data;

      // Load in the correct number of events
      // depending on whether or not filters
      // have been applied
      $scope.resetEvents();

    }, utilitiesFactory.genericHTTPCallbackError);

    // Set up an object that stores how a field that is filterable
    // should be displayed in the URL when that filter is used
    $scope.filterFieldMapping = {
      'eventTypeSlug': {
        'name': 'type'
      },
      'field_start_day': {
        'name': 'day',
        'momentFormat': 'dddd-D-MMMM-YYYY'
      },
      'ticketTypes': {
        'name': 'ticket'
      }
    };

    // Update the search filters with any that
    // have been passed into the URL.
    $scope.search = {};
    angular.forEach($location.search(), function(filterValue, filterName) {

      angular.forEach($scope.filterFieldMapping, function(filter, fieldName) {

        if (filter.name === filterName) {

          // Convert the URL friendly date to a 
          // moment object using the format specified for the filter
          if (filter.momentFormat) {
            filterValue = $window.moment(filterValue, filter.momentFormat).format('dddd D MMMM YYYY');
          }
          $scope.search[fieldName] = filterValue;
        }

      });

    });

    $scope.$watchCollection('search', function(search) {

      // Loop through each filter
      angular.forEach(search, function(filterValue, filterName) {

        if (filterValue === null) {

          delete $scope.search[filterName];

          $scope.gaPageViewOnStateChange = true;

        } else {

          // Convert the moment object to a URL friendly
          // date format if filter value is not null
          if ($scope.filterFieldMapping[filterName].momentFormat && filterValue) {
            filterValue = $window.moment(filterValue).format($scope.filterFieldMapping[filterName].momentFormat);
          } 

          // Convert filter value to lowercase
          if (typeof filterValue === 'string') {
            filterValue = filterValue.toLowerCase();
          }

        }

        // Add the filter to the URL
        $location.search($scope.filterFieldMapping[filterName].name, filterValue);
        
      });

      // Allow filter parameter change to be recorded in Google Analytics as a page view, but only if it's not the first state visited (to avoid a double page view and an incorrect 0% bounce rate).
      
      // Get virtual url for Google Tag Manager pageview
      var virtualUrl = $location.url();

      if ( $scope.gaPageViewOnStateChange === false ) {
        // Push url to GTM dataLayer
        $window.dataLayer.push({ 
          event: 'pageview',
          virtualUrl: virtualUrl 
        });

        // console.log('pageview sent');

      }
      else {
        $scope.gaPageViewOnStateChange = false;
      }

    });

    /**
     * Define filter comparator which includes all items
     * if the filter option is null, but is strict if 
     * the filter option is not null
     */
    $scope.strictOrAll = function(expected, actual) {
      
      // If moment objects are passed in, format them as strings for comparison
      if (typeof expected === 'object' && actual !== null) {
        if (expected.hasOwnProperty('_isAMomentObject')) {
          if (expected._isAMomentObject) {
            expected = expected.format('YYYYMMDDhhmmss');
          }
        }
      }
      if (typeof actual === 'object' && actual !== null) {
        if (actual.hasOwnProperty('_isAMomentObject')) {
          if (actual._isAMomentObject) {
            actual = actual.format('YYYYMMDDhhmmss');
          }
        }
      }

      if (actual === null) {

       return true;

      // Only compare strings and numbers
      } else if (typeof expected !== 'string' && typeof expected !== 'number') {

       return false;

      } else {

       // Convert numbers to strings so that they can be compared
       if (typeof expected === 'number') {
         expected = expected.toString();
       }

       // Search for a match
       return expected.match(new RegExp(actual, 'i')) !== null;
      }
    };

    /**
     * Determines whether or not the 'All days' item has been selected
     * from the event day filter
     */
    $scope.showAllDays = function() {

      if (angular.element('#event-day-filter').val() === '') {
        return true;
      }

    };

    /**
     * Determines whether or not any of the select filters are applied
     */
    $scope.filtersApplied = function() {

      var filtersApplied = false;
      angular.forEach($scope.search, function(filterValue) {
        if (filterValue) {
          filtersApplied = true;
          return false;
        }
      });

      return filtersApplied;

    };

  });