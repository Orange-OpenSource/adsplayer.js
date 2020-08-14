### Release Notes v1.5.3 (2020/08/14)
* Update packages dependencies (fix security vulnerability)
* Bugs fixing:
  - Ignore trigger with empty sources

### Release Notes v1.5.2 (2020/04/01)
* ErrorHandler and EventBus no more singleton

### Release Notes v1.5.1 (2020/03/05)
* Add trigger id and whole trigger duration in 'start' event
* Add 'timeChanged' event when media playback is progressing
* Bugs fixing:
  - Fix XML DOM parser

### Release Notes v1.4.0 (2019/01/04)
* Migrate source code to TypeScript
* Migrate module bunlder to webpack

### v1.3.0 (2018/10/15)
* Add option to disable main video playback management (pause, resume)
* AdsPlayer.load() method resolve true if pre-roll trigger
* Add API method AdsPlayer.enableLogs() 

### v1.2.0 (2018/09/12)
* Modify AdsPlayer API for init() and load() functions
* Correct package entry point declaration 

### v1.1.4 (2017/06/16)
* Use Babel polyfill for old browsers support

### v1.1.3 (2017/06/13)
* Bugs fixing:
  - Fix 'end' event not raised in case of VAST file(s) download failure

### v1.1.2 (2017/06/12)
* Correct gulp building to enable module integration using node.js (require)

### v1.1.1 (2017/05/04)
* Correct npm package publishing

### v1.1.0 (2017/05/03)
* Add support for 'acceptInvitationLinear', 'fullscreen', exitFullscreen', and 'progress' tracking events
* Add support for multiple Ads in a single VAST
* Add sample demonstration web application
* Bugs fixing:
  - Correct HTTPS aboslute urls management
  - Fix ad's media 'ended' event handler
  - Raise 'start' event only once if multiple consecutive triggers
  - Raise 'start' event for mid-roll and end-roll triggers
  - Do no send 'pause' tracking event for <video>'s 'pause' event raised at end of stream

### v1.0.0 (2016/11/28)
* Source code migration to ES6
* Add 'rewind' tracking event handler
* Bugs fixing:
  - Correct mute/unmute tracking events handling

### v0.5.0 (2016/11/25)
* Parse XML when XHR response not as XML DOM (responseXML), in case of not valid XML 'content-type' in response header fields
* Bugs fixing:
  - Correct XML parsing (namespace resolution) for Firefox and IE11 browsers
  - Do not consider empty VASTs

### v0.4.0 (2016/09/30)
* Bugs fixing:
  - Correct XML parsing (namespace resolution) for Firefox and IE11 browsers

### v0.3.0 (2016/09/06)
* Update plugin API according to hasplayer.js v1.5.0

### v0.2.2 (2016/08/25)
* Modify files downloading timeout (set to 10 sec.)
* Abort files downloading when stopping AdsPlayer

### v0.2.1 (2016/08/18)
* Bugs fixing:
  - Correct support for end-roll ad-insertion

### v0.2.0 (2016/07/12)
* Handle multiple Impressions per VAST
* Adjust automatically adsplayer volume according to hasplayer's volume
* Add events 'addElement' and 'removeElement' to notify creation and deletion of adsplayer DOM elements (<video> or <img>)
* Bugs fixing:
  - Process multiple VASTs of a trigger in chronological order

### v0.1.0 (2016/06/28)
* Refactored version
* Supports pre-roll, mid-roll and end-roll ad-insertion
* Add events ('start', 'end', 'play', 'pause', 'click') to enable application handling adsplayer's components display
* Add play/pause methods to enable application to pause/resume playback of current media ad

### v0.0.1 (2016/05/13)
* 1st version for ad-insertion plugin for hasplayer.js
* Based on Mast specification 0.9 and Vast specification 2.0
* Supports preroll ad-insertion scenario
* Supports successive ads playing supplied by one or multiple Vast
* Supports playing of ads as video files which format is natively supported by the browser
* Supports playing of ads as image files in jpeg, gif and png formats
* Supports click-through link when user clicks on ad (video or image)
