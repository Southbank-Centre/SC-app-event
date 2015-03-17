# Southbank Centre App: Event

## Installation

### Step 0

Check [this app's dependencies](https://github.com/Southbank-Centre/SC-app-event/blob/master/bower.json) and make sure that you follow the installation instructions for the SC-app-* modules that this one depends on.

### Step 1
Run the following command in your app's root directory.

    $ bower install --save Southbank-Centre/SC-app-event#n.n.n

Replace n.n.n with the version number of this module that you require. See [the list of releases](https://github.com/Southbank-Centre/SC-app-event/releases).

*Please don't install without a release number or your app will be unstable.*

### Step 2

Add **SC-app-event** to the dependency list in **[YourAppName].module.js**

### Step 3
Add the app.eventSingle and app.eventList states to your app:

    .state('app.eventSingle', {
      url: '^/whats-on/:eventAlias',
      views: {
        '@': {
          templateUrl: 'bower_components/SC-app-event/release/eventSingleView.html'
        }
      }
    })
    .state('app.eventList', {
      url: '^/whats-on',
      reloadOnSearch: false,
      views: {
        '@': {
          templateUrl: 'bower_components/SC-app-event/release/eventListView.html'
        }
      }
    })

The URLs can be changed to whatever is required, although the parameter *:eventAlias* should remain the same for the page to work.