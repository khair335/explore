## Installation ##

There are 2 ways of installing node, depending if you want different versions of installed on your system.

1. Download nodejs 14.x directly.
    1. https://nodejs.org/en/
2. Make sure you are using npm 6.14.8 or greater when using nodejs 14.x. https://www.npmjs.com/get-npm
3. (optional) Install nvm for windows. This allows you to run different versions of nodejs.
    1. https://github.com/coreybutler/nvm-windows/releases	
    2. Using powershell, run “nvm install 14.x 64” to grab the lastest node
       1. To grab 32 bit run “nvm install 14.x 32” instead
       2. (optional) You can see which versions of node is installed by using “nvm list”
       3. (optional) Switch by using “nvm use ###” where ### is the version number
     
## Source ##
Get latest code from repository

### Git ###
When using tortoiseGit and you have multiple git accounts, make sure your User Info is set to your user info for this project.

## Requirements ##
All scripts are ran from the command line from the projects root. In our case it is ran from /headlesscms/web

### Dependencies ###
Unix and MAC
Python is needed to compile the sass module. Download Python.
Windows
`npm install --global --production windows-build-tools`

## Install ##
This will install dependencies for running the application.

1. Run `npm install`

## Build ##
1. Run `npm run build` for development
2. Run `npm run build:prod` for production
3. Run `npm run build:localdev` for local development with external API URLs.

## Run ##

- Run `npm start` for local development
- Run `npm run start:localqa` to proxy to the qa server's data.
- Run `npm run start:localstage` to proxy to the stage server's data.
- Run `npm run start:prod` for production

For local development
Go to `http://localhost:3001`. Local development uses a proxy at port 3001. See `proxy.local.js`.

All other enviroment, UI's node server is ran on port `3000`.

### Basic Auth ###

For security we have rotating basic auths. So before each new terminal/powershell session, you need to temporarily set your enviroment variables. This can be set once for each terminal/powershell session.

#### OSX ####
In terminal
`export username=####`
`export password=####`

#### Windows ####
In powershell
`$env:username="####"`
`$env:password="####"`

### Host ###
Due to WAF rules blocking localhost, add to your hosts file:
`127.0.0.1 broadcomdevproxy`

Now you should be able to access data on different environments without it getting blocked.
http://broadcomdevproxy:3001/

### Cross domain scripting for local development ###
A proxy is created for local development to hook up to backend data servers. *See /web/src/server/*
 - proxy.local.js
 - proxy.localqa.js
 - proxy.localstage.js

## Debug ##
We can make use of console to display debug info, but let's use localstorage to turn it on or off.

To turn this debug info on manually add these in your localstorage through your dev tools with a value of 'true'. Delete or set it to 'false'

- `debug_gtm` is used to display the gtm.
- `debug_translation` is to display translations.

## Maintanance ##
For consistency, one person is usually in charge of doing `npm update`. This person confirms functionality of the site.

npm does vulernability check when you do an npm install. Do a `npm audit fix` to fix the vulernabilities.

#### *DEPRECATED* ####
Since we develop locally using localhost and the api is on another domain, our browser complains. Solved by using a firefox addon "cors everywhere". 
Our javascript code for "fetch"ing should also have extra parameters which is "credentials" either "include" or "same-origin" https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
This will allow cookies for scripts.

For developement, Concurrently is used to run both run webpack and nodemon to check for any changes and to do a build and restart if there are any changes.


## Dependencies ##
bootstrap - Used for layout
reactstrap - Bootstrap component wrapper for react.
react-helmet - Helper to inject <head> data for each page.
@fortawesome/fontawesome
@fortawesome/react-fontawesome - https://github.com/FortAwesome/react-fontawesome

## Webpack ##
`/src/weback.*.js`

Webpack builds our React and SASS files and outputs them to `/public` folder. Each build appends a unique hash so that the client always has a fresh copy of our files.

### Webpack 5 ###
10/20/2021 Upgraded to webpack 5. The following dependencies are causing deprecation warnings and needs upgrades.
- extract-css-chunks-webpack-plugin
- preload-webpack-plugin

### Vendors ###
Vendor or 3rd party plugins are built into a seperate javascript file.

### Lazy Load ###
Webpack packs javascript and css based on imports in source. This allows the client to download only the necessary source for a page, which creates a much smaller foot print.

## Folder Structure ##
/public - Any file in this directory is served to the client
/public/js - Running webpack builds the js in this directory. This can be changed easily in webpack.
/src/client - Client scripts that get compiled and ran on the client
/src/server - Server side scripts

## Config ##
Most configuration settings are located in `/src/clinet/config.js`.
- Endpoint urls
- Okta settings
- Locale

## Routing ##
`/web/src/client/index.js`

In order of precedence, page routing is done 2 ways. 
1. First the client attempts to match url's using React Router Dom, to our specific page component.
2. If none exists, then fallback to our `<PageTemplateRouter>`

### Page Template Routing ###
The client determines what page to render based on an attribute `template` in the JSON.

1. Based on the path in the url, the client fetches the page json through the api. (See `/src/routes/page.jsx`)
2. `<PageTemplateRouter>` then loads the proper Page Component based on `template` and passes the JSON data to the template to render the specific page.

## Cookies ##
Cookies are used for myBroadcom. Authentication goes through Okta, in which we save tokens to be passed to the backend through cookies.

- BRCMPortalCookie - Okta
- BRCMAuthHeader - Okta 
- BRCMWASSOCookie
- agreement - Document downloads EULA confirmation
- ribbonOn - Cookie consent

### Onetrust ###
A 3rd party vendor, Onetrust, handles displaying of banner and cookie policy page.

To display the banner, two scripts provided by Onetrust is embedded into the page. 
#### Ribbon ####
Globally, in `/web/server/views/partials/head.ejs`, the Onetrust script is embedded across all pages to display the ribbon. This script is a custom one off version and we are serving this file up from our CDN in our backend.

The issue with the ribbon is that it overlaps the footer. To fix that,we add a class `ribbon` to the `<footer>` and remove it when the banner is not visible. We search for a dom with the class name `optanon-alert-box-wrapper` and if it exists we add the `ribbon` class. 

We also attach an onClick event to the cookie ribbon to remove the `ribbon` class when the ribbon is closed.

#### Cookie Policy Page ####
For the cookie policy page, a seperate script is embedded to rerun Onetrust script. `/web/public/js/onetrust.js`. This is given to us by Onetrust to fix issues with their script not running in our React Application.

This script is embedded on a page where a dom with the id name `optanon-cookie-policy` is embedded in `/web/src/client/components/liveEvents.js`. A custom page with the dom as part of the content is created to display the content.
 
## Local Storage ##
Local storage is used for storing states. 

- Okta - Stores Okta session tokens
- okta-tos - Did the user just accept the TOS, then don't update the gdpr.
- secureRouterReferrerPath - TODO: After we login, we want to redirect back to the page where they were last before attempting to login.

## Okta ##
Okta is maintained by Broadcom IT.

We currently use the helper libraries `@okta/okta-auth-js` and `@okta/okta-auth-js` to authenticate with Okta. See `config.js` for Okta configurations.

Okta ID token is valid for 1 hour. Non adjustable by Okta. We currently do not `auto_renew` the ID token and just let it expire.

User flow for authentication:
1. `myBroadcomLogin.jsx` is our entry point.
2. User enters username/password
3. The user's username is checked against `checkgdpr` whether or not they already accepted the TOS.
    1. If they already accepted, don't show TOS acceptance.
    2. If they haven't, show TOS acceptance.
    3. If they are a Broadcom employee (i.e @broadcom.com, @broadcom.net), don't show TOS
4. Authenticate with Okta
5. Okta redirects to our call back to set cookies `/mybroadcom/implicit/callback`
6. If user has access to the Okta application, id tokens are set in `BRCMAuthHeader`.
7. If user accepted TOS, then we update our backend `updategdpr`
8. After authentication is handled, if there is a `fromURI`, they are redirected to the URI. This comes from portal.broadcom.com.

### Okta UI ###
Okta UI is handled by Okta Sign-in Widget.
https://github.com/okta/okta-signin-widget

- CMS Handles the copy and links on the page using get getjson?url=mybroadcom/login. 
- GDPR and copy is inserted into Okta's Sign-in Widget by use of dom manipulation and React Components.
- The URL is fixed because UI's router also handles security on the front end.


### Local Development ###
Current local development for Okta uses Jonathan's test Okta development account due to localhost not being whitelisted in Okta. If you need to debug anything Okta specific, here's a quick howto.

1. Create an account at https://developer.okta.com/
2. Create a Single Page Application "myBroadcom" in Okta.
3. Under the Application "General" settings, add the "Login redirect URIs" `http://localhost:3001/mybroadcom/implicit/callback`
4. Temporarily change `/web/src/client/config.js` `this.okta` under "local" enviroment for all your Okta settings.
5. In Okta, add `http://localhost:3001` as "Trusted Origins" for both "CORS" and "Redirect"
6. Add users with the same email address as the enviroment you are testing on. https://elementprojects.atlassian.net/wiki/spaces/BL/pages/703987731/Okta+User+Integration . The intent is to mimic the user's email.

#### MFA ####
Setting up MFA in Okta. Use Classic UI.
1. Security -> Authentication -> Sign On: Add New Okta Sign-in Policy. Important, make sure "Prompt for Factor" is enabled.
2. Security -> Multifactor: Enable SMS and Email.
3. Security -> Multifactor -> Factor Enrollment: Select either SMS or Email as required.
4. Applications -> Sign On -> Sign On Policy -> Add Rule: Prompt for factor


## Localization ##
Attributes in JSON are in english and we reference them by english.

The locale is set server side based on html header. The locale is then passed as a javascript variable `gLocale`. This value is passed to the api as a query string.

## Cache ##
Backend does caching on requests to `getjson` based on URI. To circumvent that on content updates, we need to change the URI by passing the query string `updateddate` which is given to us by a previous call to `getmetadata`. 

Requests to `getjson` are cached client side use default browser settings.

Most fetch's on the site does a `no-store` which doesn't cache on the client side.

## Meta ##
Meta tags are injected on our node.js side. We request the backend for a specific page, and they return the proper data.

The `<header>` meta data comes from both `getmetadata` and `getjson`. Since `getmetadata` is incomplete, we merge `getmetadata` into `getjson`.

    ( {setMeta} from utils.jsx, head.ejs )
    Location: client/components/utils.jsx, server/views/partials/head.ejs

On initial page load, metadata is set in head.ejs. The data is received via a separate metadata fetch: getmetadata?vanityurl=&locale=en-us which can be used to get the data again if needed.
On content page changes, metadata is updated via the setMeta component. Canonical links are also updated with this component. SetMeta requires two props data (from page props), and path (current url). 

## Pages ##
`/src/client/pages`

Pages are actual the actual webpages. The names, for the most part, are named exactly (including case) as the template name from the backend.

### Create ###
To create a page
1. Copy `/src/client/pages/_boilerplate.jsx`
2. Name it the exact name (including case) as the template name from the backend.
3. Add it to `<PageTemplateRouter>`

### Server Side Rendering ###
`/src/server/views`
In order to render dynamic data from our UI node server, we are using a templating system called "Embedded Javascript" templates, or EJS. Since we have using React, there are some cases where we want pure HTML rendered. An example is setting the meta and head data.

Webpack builds some of these templates located in `/src/client/*.ejs` and then outputs them to `/src/server/views`

### Body content blocks ###
Body content blocks are sub components that can be rendered anywhere across any page. These body content blocks have a routing system similar to that of `<PageTemplateRouter>` named `<TemplateFactory>`

#### Create ####
To create a body content block tempate
1. Copy `/src/client/templates/_boilerplate.jsx`
2. Name it the exact name (including case) as the template name from the backend. Put it in the appropriate directory, trying to keep the same paths as the URL.
3. Add it to `<TemplateFactory>`

To add it to specific page
Use the helper functions `getComponentFromTemplate` and `getComonentsFromContentBlockss`

### Embedded Content ###
CKEditor as it's called in the CMS, has dom elements that require javascript. Since we are in a react environment, React doesn't know of this dom so we need to convert these elements to a React Component to make it stateful.

To do so, each page that requires this must call `liveEvents`, which converts doms to a React Component. A higher order component `<withLiveEvents>` is a helper to attach to a page which calls `liveEvents`

### Components ###
Components are reusable elements. Rule of thumb: if you use a piece of code more than once, make it a component.

#### Links ####
`<SiteLink>` is our powerhouse for links. Whenever you need to use an `<a>` use `<SiteLink>` instead. This takes care of the Single Page Application routing so it doesn't reload the page.

Based on the "to" prop, `<SiteLink>` determines whether it should stay as a SPA or load as an external link.

`<DocumentLink>` takes care of specific downloadable documents. Certain business rules such as EULA and security is handled with `<DocumentLink>`

#### Icon ####
   location: /components/Icon.jsx
Icon is a helper component to help render icons based on dynamic content. Since data is all over the place, we need to capture all permutations here.

   _icons.scss
   location: scss/base/
Defines the custom broadcom icons. Important! do not put styling in this file as it is overwritten when new icons are added. 
When you update this file remember to add the "no styles here" warning at the top (see current version of file.)

#### Fonts ####
   location: css & css/fonts

We use licensed fonts from online libraries. The font files live in css/fonts. There are 4: brcm.eot, brcm.svg, brcm.tiff, brcm.woff. These are all the same file in different formats. The font-family declarations are in scss/base/_icons.scss. This file also contains the icon css definitions.

#### Image ####
Image is a helper component to help render images. This is to help render all permutations of image data coming from data.

#### TabPage ####
Any page that requires a tab and that wants to take advantage of `#` url should use this.

If there is an attribute `tabbedpageName` in the JSON data, this will set the default tab for this page.

There will exists a `hash` attribute to define the `#` name for the URL. These hashes only exist in English.

### Page Definitions ###
Some unique details for specific pages.

#### Swiftype Pages ####
These pages obtain their data from swiftype.
`/src/client/pages/site-search.jsx`
`/src/client/pages/broadcom-faceted-search.jsx`
`/src/client/pages/support/knowledgebase.jsx`

#### Blog ####
TODO: New Blog goes here

#### Parametric Search ####
`ParametricSearch.jsx`
https://cmsgwqa.aws.broadcom.com/products/ethernet-connectivity/switching/strataxgs
Sorting by data rate https://en.wikipedia.org/wiki/Data-rate_units#Decimal_multiples_of_bits is based off a suffix `(Gbps)_Measure` on the attribute name. Naming conventions for the data must contain a space between the rate and value. Ex. "143 Tb/s".

## Styles ##
`/src/client/scss`

Each page or component that requires it's own css is seperated as it's own SASS file. (See Webpack)

## CSS File path ##

### All variable ( like color and font ) ###
file path ==> web/src/client/scss/base/_variables.scss

###  All common css comes from _base file (global css) ### 
file path ==>  web/src/client/scss/base/_base.scss

###  All boostrap  css comes from _bootstrap file  ### 
file path ==>  web/src/client/scss/base/_bootstrap.scss

###  Animation css comes from transitions file ==> ### 
file path ==>  web/src/client/scss/base/_transitions.scss

###  Mega Menu and and header css comes from _page-header.scss file ==> ### 
file path ==>  web/src/client/scss/components/_page-header.scss

###  Footer css comes from _page-footer.scss file  ==> ### 
file path ==>  web/src/client/scss/components/_page-footer.scss

###  Breadcrumbs css comes from _breadcrumbs.component.scss file  ==> ### 
file path ==>  web/src/client/scss/components/_breadcrumbs.component.scss

###  Tab css comes from _tab.component.scss file  ==> ### 
file path ==>  web/src/client/scss/components/_tab.component.scss

###  Dropdown css comes from _dropdown.component.scss file  ==> ### 
file path ==>  web/src/client/scss/components/_dropdown.component.scss

###  Bootstrap custom popover style comes from _popover.component.scss file  ==> ### 
file path ==>  web/src/client/scss/components/_popover.component.scss

###  All other css for perticular page comes from scss folder ==> ### 
file path ==>  web/src/client/scss

###  All videos css comes from video-library.scss ==> ### 
file path ==>  web/src/client/scss/video-library.scss

## Products details page ##
Data is not validated, so we need to do alot of validation locally.
https://www.broadcom.com/products/wireless/amplifiers/low-noise/mga-16316#optional

## Home Carousel ##
If the user is initially hovered over the carousel, the carousel is paused. If they aren't initially over the carousel, it auto rotates. Hovering over the carousel, pauses it. Intervals are set by CMS.

## 3rd Party Layout ##
3rd party vendors such as NASDAQ require our Header and Footer. A simple version of our Header and Footer is created `<SimpleHeader>` and `<SimpleFooter>`

Urls are supplied which renders our SimpleHeader and SimpleFooter
- /justheader
- /justfooter
- /justlayout

### Redirects and 404's ###
Redirects are done on our node.js. We request the backend for that page and they return 301 or 404

## Fetch ##
In order to pass cookies to the backend api, add 
fetchAPI(url, {credentials: config.api_credentials}) or 
fetchAPI(url, {credentials: "same-origin"})

We also don't cache any data locally.

### Test Pages ###
Pages that uses API.
Subscribe 
https://cmsstaging.broadcom.com/products/storage/host-bus-adapters/sas-nvme-9500-16i
Document download
https://cmsstaging.broadcom.com/support/download-search?pg=Symantec+Cyber+Security&pf=Information+Security&pn=&pa=&po=&dk=&pl=
Document Library
https://cmsstaging.broadcom.com/support/resources/doc-library
Parametric search
https://cmsstaging.broadcom.com/products/optocouplers/industrial-plastic/digital-optocouplers
Blog
https://cmsstaging.broadcom.com/sw-tech-blogs/aiops
Product News
https://cmsstaging.broadcom.com/company/news/product-releases
Find a Partner
https://cmsstaging.broadcom.com/how-to-buy/partner-distributor-lookup
myBroadcom Login
https://cmsstaging.broadcom.com/mybroadcom/login
myBroadcom landing after successful login
https://cmsstaging.broadcom.com/mybroadcom
Product Detail - Previously viewed
https://cmsstaging.broadcom.com/products/storage/host-bus-adapters/sas-nvme-9500-16i
Contact Form - unrelated front investigate why Product Family not populated. Support ticket 187092
https://cmsstaging.broadcom.com/support/request-tech-support?fct=Support&pf=Custom+Silicon&fc=Africa
Protection bulletin
https://cmsstaging.broadcom.com/support/security-center/protection-bulletin
ThreatList_a2z

## ENOR ##
TODO: John
`<SiteLink>`
`<ButtonTrack>`

## CAPTCHA ##
    (Captcha.jsx)
    Location: client/components/

Some really good info about spam bots and their tactics:
Wikipedia under the Automated Techniques section: https://en.wikipedia.org/wiki/Anti-spam_techniques
Technical Study on math captchas: http://cmp.felk.cvut.cz/~cernyad2/TextCaptchaPdf/Pitfalls%20in%20CAPTCHA%20design%20and%20implementation.pdf

After doing a lot of research for the best captcha to use it became clear that any captcha that is custom
is already ahead of the game. Spam bots look for known patterns that tell them what kind of captcha they
are up against. All of the services such as Googles Recaptcha, anything on WordPress, and open source 
captchas are well known and even the average bots have ways around them. It's not worth the spammers 
time to develop a way around a single custom blocker. So, we have single custom blocker.

Our captcha has an open design that allows for additional tests to be added. In the future we intend to expand
the tests probably adding number of hits from same ip, checksum, url filtering, time on page, time on form fields, 
tarpits, mouse movements, etc.

For now, we have a simple captcha with 2 honeypots, and a false image test. In this case we put up two images and ask
the bot to pick which one has a dog, cat, mouse etc in it. This is a common captcha pattern and the intent is to
fool the bot into thinking it is one of those and into using a default a/b strategy. In reality the images don't show
animals but are the math elements that the humans see.

The submit button does not exist as a DOM element until the captcha succeeds. This is to get around another typical 
bot strategy that seeks to enable the button directly. This was a vulnerability on our old production version 
which used recaptcha.

We accept all entries at some point. If we think it is a bot we flag it in the email subject line with text. The idea
is that the email managers can set up a filter that dumps anything with this message into a spam folder. Periodically,
they can check it to make sure there were no false positives. This is also bot strategy. Once we determine that the
visitor is probably a bot we accept the entry and flag it. We want the bot to think it succeeded and go away.

The Captcha code is extensively commented for additional info and details on logic.

#### Share Menus ####
    (brcmShare.jsx)
    location: client/components/

Builds a menu of social sites. Once a site is selected, the component builds the correct query string for the site selected and launches the site in a new tab.
There are 3 types of menus (currently) available, blog, featured, and breadcrumb. Blog, returns the large format with the featured sites (such as Twitter) displayed
with a '+' sign for a drop down menu that has the rest. The featured items are the first n items in the list. This value can be adjusted to get more or fewer
featured items. The breadcrumb version returns just the dropdown menu seen when clicking on share in the breadcrumb menu.

The number of featured items has a default value set as a state item in the constructor. 

To use, pass in the view ('blog', 'featured', 'breadcrumb') and number of featured items (optional) as props. 
     - "blog" = featured menu + breadcrumb version dropdown
     - "featured" = just the featured items menu - not used so not built yet but hook is there (see update() case:featured)
     - "breadcrumb" = just the breadcrumb dropdown (all the sites, button is a +)

     example:
        {
            view: "blog",
            featured: 3
        }

brcmShare.jsx has commenting throughout for additional logic.

## Audio/Video ##
Most video/audio is hosted on limelight. We use video.js for the front end to display the video.

For audio, we use html5 audio player and green audio player to skin.
https://reactjsexample.com/react-audio-player/
https://www.cssscript.com/html5-green-audio-player/

https://github.com/greghub/green-audio-player

https://www.symantec.com/podcasts/symantec-cyber-security-brief-podcast
## Accessibility ##
Branch: ui/accessibility
### Tools for Accessibility ###
https://wave.webaim.org/

I use the Wave firefox extentension to fix accessibility issues.

### Known Issues ###
Firefox on Mac doesn't show tabs.  To correct there's a stackoverflow that turns it on.
https://stackoverflow.com/questions/11704828/how-to-allow-keyboard-focus-of-links-in-firefox/11713537

There is an issue where focus content blocks on mouse click. To fix, I added javascript to append a class `.access-mouse` to body to indicate a mouse click. We can distinguish between tab and mouse click and style accordingly.

## Problems ##
String from CMS contain HTML tags. When using in React, it renders them for security reasons.
We need to set requirements for the JSON file because values are missing.
JSON data is really nested. To get the image for a home page banner, you have to go like 3 levels deep.
Test: Dynamic data.
Should we sanatize text. Remove html tags? React's dangerouslySetInnerHTML. Is there a possibility of xss?
Reactstrap <Fade> is broken when looping. Corrupts data.

## MISC ##
TODO: What is the proper demo location?
Demo location http://ichabodgwdev.aws.broadcom.com/

## Updates ##
### 05/28/2019 ###
Package                                    Current  Wanted  Latest  Location
@babel/cli                                   7.2.3   7.4.4   7.4.4  broadcom
@babel/core                                  7.1.6   7.4.5   7.4.5  broadcom
@babel/node                                  7.0.0   7.4.5   7.4.5  broadcom
@babel/plugin-proposal-object-rest-spread    7.0.0   7.4.4   7.4.4  broadcom
@babel/polyfill                              7.0.0   7.4.4   7.4.4  broadcom
@babel/preset-env                            7.1.6   7.4.5   7.4.5  broadcom
@okta/okta-auth-js                           2.4.0   2.5.0   2.5.0  broadcom
assets-webpack-plugin                        3.9.7  3.9.10  3.9.10  broadcom
babel-loader                                 8.0.4   8.0.6   8.0.6  broadcom
body-parser                                 1.18.3  1.19.0  1.19.0  broadcom
bootstrap                                    4.1.3   4.3.1   4.3.1  broadcom
clean-webpack-plugin                         1.0.0   1.0.1   2.0.2  broadcom
css-loader                                   1.0.1   1.0.1   2.1.1  broadcom
custom-event-polyfill                        1.0.6   1.0.7   1.0.7  broadcom
express                                     4.16.4  4.17.1  4.17.1  broadcom
history                                      4.7.2   4.9.0   4.9.0  broadcom
mini-css-extract-plugin                      0.4.5   0.4.5   0.7.0  broadcom
moment                                      2.22.2  2.24.0  2.24.0  broadcom
nodemon                                     1.18.7  1.19.1  1.19.1  broadcom
prop-types                                  15.6.2  15.7.2  15.7.2  broadcom
query-string                                 5.1.1   5.1.1   6.5.0  broadcom
raw-loader                                   1.0.0   1.0.0   2.0.0  broadcom
react                                       16.6.3  16.8.6  16.8.6  broadcom
react-dom                                   16.6.3  16.8.6  16.8.6  broadcom
react-image                                  1.5.1   1.5.1   2.1.1  broadcom
react-responsive                             6.0.1   6.1.2   6.1.2  broadcom
react-router-dom                             4.3.1   4.3.1   5.0.0  broadcom
reactstrap                                   6.5.0   6.5.0   8.0.0  broadcom
smoothscroll-polyfill                        0.4.3   0.4.4   0.4.4  broadcom
uglifyjs-webpack-plugin                      2.1.1   2.1.3   2.1.3  broadcom
url-parse                                    1.4.4   1.4.7   1.4.7  broadcom
webpack                                     4.26.1  4.32.2  4.32.2  broadcom
webpack-cli                                  3.1.2   3.3.2   3.3.2  broadcom
webpack-merge                                4.1.4   4.2.1   4.2.1  broadcom
### 08/22/2019 ###
Needed to revert to query-string@5 to support ie11

## Optimizations ##
### 08/07/2019 ###
- node express compress
- extract-css-chunks-webpack-plugin": "^4.7.4" custom insert to set preload
- preload ttf font
- Removed MonthlyThreatReport.
- Lazy load okta sign in widget.
- Lazy load videojs.
- Use dayjs instead of moment.

## Business Rules ##
| Name        | Description           |
| --------------------- |:-------------:|
| Document Descriptions | Document descriptions in document boxes (ex DND and product detail) will be truncated to 350. A primitive parser is to used to ignore entities and html.

## VMWare ##

### Build ###
- Run `npm run build:vmdev` for development
2. Run `npm run build:vmprod` for production
4. etc ...
5. Run `npm run build:localdev` for local development with external API URLs.

### Run ###

- Run `npm run start:localvmdev` for local development
- Run `npm run start:localvmqa` to proxy to the qa server's data.
- Run `npm run start:localvmstage` to proxy to the stage server's data.
- Run `npm run start:vmprod` for 

### Split ###
In `config.jsx`, there is a global object `microsite` to describe a microsite. The name of the microsite can be used in logic.


Some areas of FE code will be split to distinguish between broadcom and vmware. The split will occur in the build process, folder structures, and FE code.

#### Styles ####
The scss folder will be split by IP each brand. The build process determines what folder will be used.

- scss/broadcom
- scss/vmware
Each folder should at minimum contain the same .scss files. 

#### Themes ####
Cards will be wrapped with a class `theme-card-###` where ### is the theme delivered in json converted to lower case.
Content blocks will be wrapped in a class `theme-content-block-###` where ### is the theme delivered in json converted to lower case.
