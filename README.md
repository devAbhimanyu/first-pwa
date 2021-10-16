# first-pwa

Understanding PWA by building a simple instagram-clone, built using vanilla js

## What are Progressice Web Apps?

- A web app which has been enhanced to look and feel like a native app.
- Be reliable, load fast and provide offline functionality
- Fast and respond quickly to user actions

## Mobile Web vs Native App

1. Push Notifications
2. Easier access, apps are available on the homescreen
3. Access to Native Device Features like camera, mic
4. Can work offline
5. Web app have a bigger reach
6. web apps can bypass app store guidelines

## App-Manfest

### Make your app installable

Properties of a manifest

1. name: long name of the app (e.g instaClone) (on Splashscreen)
2. short_name : name used below the icon
3. start_url: which page to load on app startup like index.html
4. scope: which pages are included in the PWA ("." => all pages)

   - standalone:The application will look and feel like a standalone application.
   - fullscreen : behaves like native app taking up the fullscreen

5. display: should it look like a standalone app> (default=> standalone)
6. background_color: Backgound whilst loading and on Splashscreen ("#eee")
7. theme_color: Theme color(eg on the top bar in task switcher)
8. description: Description of the app used by the browser
9. dir: Read direction of your app ('ltr'=> left to right)
10. lang: main language of the app ('en-US' )
11. orientation: set/enforce default app orientation portrait or landscape("portrait-primary)
12. icons: [...] configure icons for the browser to choose the best fit
    - {
      src: icon path,
      type: image type =>png jgeg
      sized: icon size, browser choosed best one for give device => 48x48/ 96x96
      }
13. related_application: path to native apps if available
    - {
      platform:"play",
      url: url to playstore
      id: id of the app in the store
      }

### Making app installable

To make the web site installable, it needs the following things in place:

A web manifest, with the correct fields filled in
The web site to be served from a secure (HTTPS) domain
An icon to represent the app on the device
A service worker registered, to allow the app to work offline (this is required only by Chrome for Android currently)
