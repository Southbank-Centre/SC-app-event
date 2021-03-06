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
    eventFactory.getEventSingle($stateParams.eventAlias, function(data) {

      // SUCCESS
      // Attach the event data to the scope
      $scope.event = data;
      
      // Set description meta tag to event short description
      $rootScope.websiteTitleDefault = $rootScope.websiteTitle;
      $rootScope.websiteTitle = $scope.event.title;
      $rootScope.websiteDescriptionDefault = $rootScope.websiteDescription;
      $rootScope.websiteDescription = $scope.event.field_teaser.value.replace(/(<([^>]+)>)/ig, '');

    }, utilitiesFactory.genericHTTPCallbackError);

    $rootScope.$on('$stateChangeStart', function() {

      $rootScope.websiteTitle = $rootScope.websiteTitleDefault;
      $rootScope.websiteDescription = $rootScope.websiteDescriptionDefault;

    });

  });