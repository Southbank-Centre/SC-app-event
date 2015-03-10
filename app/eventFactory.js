'use strict';

/**
 * @ngdoc service
 * @name wowApp.factory:eventFactory
 *
 * @description
 * Factory for loading event data into the wowApp
 */

angular.module('SC-app-event')
  .factory('eventFactory', function($http, $rootScope, $filter, $window, utilitiesFactory, angularMomentConfig) {

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
    
  });