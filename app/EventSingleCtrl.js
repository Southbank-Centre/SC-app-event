'use strict';

/**
 * @ngdoc controller
 * @name SC-app-event.controller:EventSingleCtrl
 * @controller
 *
 * @description
 * Defines the state and behaviour of the $scope for the eventSingleView state
 */

angular.module('SC-app-event')
  .controller('EventSingleCtrl', function ($rootScope, $scope, $stateParams, $state, eventFactory, utilitiesFactory) {

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

  });