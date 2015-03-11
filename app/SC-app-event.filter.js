/**
 * @ngdoc filter
 * @name SC-app-event.filter:formatTicketHelpText
 * @filter
 *
 * @description
 * Replaces [TICKET NAME] in ticket help text with the name of the ticket
 */
angular
  .module('SC-app')
  .filter('formatTicketHelpText', function() {

    return function (ticket) {

      return ticket.field_help_text.replace(/\[TICKET NAME\]/g, ticket.name);

    };

  })