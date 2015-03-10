// 'use strict'; - Disabled to allow the festival planner to load (otherwise Uglify adds this to the top fo the minified scripts.js file)

/**
 * @ngdoc overview
 * @name wowApp
 * @description
 *
 * WOW - Women of the World Festival website AngularJS application.
 */
angular
  .module('SC-app-event', [
    'angular.filter',
    'angularMoment',
]);;'use strict';

/**
 * @ngdoc controller
 * @name wowApp.controller:EventListCtrl
 * @controller
 *
 * @description
 * Defines the state and behaviour of the $scope for the eventListView state
 */

angular.module('SC-app-event')
  .controller('EventListCtrl', ["$rootScope", "$scope", "$stateParams", "$location", "eventFactory", "utilitiesFactory", "$filter", "$window", function ($rootScope, $scope, $stateParams, $location, eventFactory, utilitiesFactory, $filter, $window) {

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

      // Allow filter parameter change to be recorded in Google Analytics as a page view
      // Get virtual url for Google Tag Manager pageview
      var virtualUrl = $location.url();

      // Push url to GTM dataLayer
      $window.dataLayer.push({ 
        event: 'pageview',
        virtualUrl: virtualUrl 
      });

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

  }]);;'use strict';

/**
 * @ngdoc controller
 * @name wowApp.controller:EventSingleCtrl
 * @controller
 *
 * @description
 * Defines the state and behaviour of the $scope for the eventSingleView state
 */

angular.module('SC-app-event')
  .controller('EventSingleCtrl', ["$rootScope", "$scope", "$stateParams", "$state", "eventFactory", "utilitiesFactory", function ($rootScope, $scope, $stateParams, $state, eventFactory, utilitiesFactory) {

    /**
     * Method for getting one event from the API
     */
    eventFactory.getEventSingle($stateParams.eventId, function(data) {

      // SUCCESS
      // Attach the event data to the scope
      $scope.event = data;
      
      // Set description meta tag to event short description
      $rootScope.eventDescription = $scope.event.field_teaser.value.replace(/(<([^>]+)>)/ig, '');
      $rootScope.$broadcast('event:displayingEventPage');

    }, utilitiesFactory.genericHTTPCallbackError);

  }]);;'use strict';

/**
 * @ngdoc service
 * @name wowApp.factory:eventFactory
 *
 * @description
 * Factory for loading event data into the wowApp
 */

angular.module('SC-app-event')
  .factory('eventFactory', ["$http", "$rootScope", "$filter", "$window", "utilitiesFactory", "angularMomentConfig", function($http, $rootScope, $filter, $window, utilitiesFactory, angularMomentConfig) {

    return {

      /**
       * @ngdoc method
       * @methodOf wowApp.factory:eventFactory
       * @name wowApp.factory:eventFactory#getEventSingle
       * @returns {undefined} Undefined
       * @param {string} eventId The ID of the event
       * @param {function} callbackSuccess The function to call when the HTTP request succeeds
       * @param {function} callbackError The function to call when the HTTP request fails
       *
       * @description
       * For getting data for a single event by event ID
       */
      getEventSingle: function(eventId, callbackSuccess, callbackError) {

        $http.get('/json/api/performance/'+eventId)
          .success(function(performance) {

            // Correct date format for start and end dates
            if (performance.field_start_time) {
              performance.field_start_time = utilitiesFactory.timestampSecondsToMS(performance.field_start_time);
            }
            if (performance.field_end_time) {
              performance.field_end_time = utilitiesFactory.timestampSecondsToMS(performance.field_end_time);
            }

            // Calculate event duration and attach to event data
            if (performance.field_end_time && performance.field_start_time) {
              performance.duration = (performance.field_end_time/60000) - (performance.field_start_time/60000);
            }

            callbackSuccess(performance);

          })

          .error(callbackError);

      },

      /**
       * @ngdoc method
       * @methodOf wowApp.factory:eventFactory
       * @name wowApp.factory:eventFactory#getEventList
       * @returns {undefined} Undefined
       * @param {function} callbackSuccess The function to call when the HTTP request succeeds
       * @param {function} callbackError The function to call when the HTTP request fails
       *
       * @description
       * For getting data about all published events, sorted by start time ascending
       */
      getEventList: function (callbackSuccess, callbackError){

        // Function that loads the event list data from the API
        var loadData = function() {
          $http.get('/json/node.json?type=performance&sort=field_start_time&direction=ASC&field_festival=' + $rootScope.festivalId)

          .success(function(performances) {

            // If ticketing data already loaded, format event list data
            if ($rootScope.ticketingDataLoaded) {
              formatData(performances);
            // If not, wait for ticketing data to be loaded before formatting event list data
            } else {
              $rootScope.$on('event:ticketingDataLoaded', function() {
                formatData(performances);
              });
            }

          })

          .error(callbackError);
        };

        // Function that formats the event list data once it has been received
        // and the ticketing data has also been loaded onto the festival object
        var formatData = function(performances) {

          // Array that will contain a list of keys for items
          // that should be removed from the list
          var itemsToRemove = [];

          angular.forEach(performances.list, function(item, i) {

            // If item doesn't have an associated production,
            // store index of item so it can be removed
            if (!item.field_production) {

              itemsToRemove.push(i);

            } else {

              // Correct date format for start and end dates
              item.field_start_time = $window.moment(utilitiesFactory.timestampSecondsToMS(item.field_start_time)).tz(angularMomentConfig.timezone);
              item.field_end_time = $window.moment(utilitiesFactory.timestampSecondsToMS(item.field_end_time)).tz(angularMomentConfig.timezone);
              
              // Get time from event start time for use in view filters
              if (item.field_start_time) {

                // add event day to scope for use in event list view filter  
                var eventTimestamp = item.field_start_time;
                item.field_start_day = $window.moment(eventTimestamp).tz(angularMomentConfig.timezone).startOf('day').format('dddd D MMMM YYYY');

                // add event hour to scope for use in event list hour grouping  
                var eventHour = $window.moment(eventTimestamp).tz(angularMomentConfig.timezone).startOf('hour');
                item.field_start_hour = eventHour;

                // add event type to first level of scope as cannot access from nested json
                var eventType = item.field_production.field_event_type.name;
                item.eventType = eventType;
                item.eventTypeSlug = $filter('slugify')(eventType);

                // add event ticket types to first level of scope
                if (item.field_wristband_ticket !== null) {
                  item.ticketTypes = [];
                  // Loop through each ticket type assigned to the performance
                  angular.forEach(item.field_wristband_ticket, function(ticketType) {

                    // Add to top level scope of the item
                    item.ticketTypes.push($filter('slugify')(ticketType.name));

                  });
                }
              }

            }

          });

          // reverse the array so that when its are removed,
          // the indexes that follow aren't changed
          itemsToRemove.reverse();


          // Remove items that don't have associated productions
          angular.forEach(itemsToRemove, function(index) {

            performances.list.splice(index, 1);

          });

          callbackSuccess(performances);

        };

        // If festival data already loaded, load event list data
        if ($rootScope.festivalDataLoaded) {
          loadData();
        // If not, wait for festival data to be loaded before loading event list data
        } else {
          $rootScope.$on('event:festivalDataLoaded', function() {
            loadData();
          });
        }

      },

      /**
       * @ngdoc method
       * @methodOf wowApp.factory:eventFactory
       * @name wowApp.factory:eventFactory#getEventCount
       * @returns {undefined} Undefined
       * @param {function} callbackSuccess The function to call when the HTTP request succeeds
       * @param {function} callbackError The function to call when the HTTP request fails
       *
       * @description
       * For getting the count of all published events for this festival
       */
      getEventCount: function(callbackSuccess, callbackError) {

        $http.get('/json/node.count?type=performance&field_festival='+$rootScope.festivalId)

          .success(function(eventCount) {

            callbackSuccess(eventCount.count);

          })

          .error(callbackError);

      }

    };
    
  }]);