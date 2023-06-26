# CoreMediaIO Device Abstraction Layer (DAL)

Adopted from https://github.com/christopher-hesse/mac-virtual-camera

## Prerequisites
```
sudo gem install cocoapods
brew install autoconf automake libtool pkg-config protobuf
```

## Developing 🛠

* Build it in Xcode
* Find `Hologram Camera.plugin` in Xcode's 'Products' folder
* Right click `Hologram Camera.plugin` and choose 'Show in Finder'
* Copy the plugin bundle to `/Library/CoreMediaIO/Plug-Ins/DAL/`
* Open QuickTime
* Watch the logs in Console.app for any logs prefixed with `CMIOMS`

Useful tools: [Cameo](https://github.com/lvsti/Cameo) by @lvsti. It allows you to inspect DAL plugins and see all their properties at a glance. It was very useful to take a known-working plugin (like [lvsti/CoreMediaIO-DAL-Example](https://github.com/lvsti/CoreMediaIO-DAL-Example) and [Snap Camera](https://snapcamera.snapchat.com/)) and then use Cameo to understand the differences between those plugins and this plugin.

## Before Shipping Code

Before you bundle this code into your software, you should change the class names to something unique! Objective-C doesn't have namespaces and so if you keep the classes named `Stream`, `Device`, `ObjectStore`, `PlugIn` etc your plugin may not work if you use it along with someone else's plugin who also didn't change the names. This can cause [real bugs](https://github.com/johnboiles/obs-mac-virtualcam/issues/232) where your plugin won't work if someone else's plugin is installed. Typically in Objective-C you add a few letters to the front of your classes to make them unique (e.g. `JBStream`, `JBDevice`, `JBObjectStore`, `JBPlugin`).

You must also change the plugin UUID to something unique in the Info.plist. The sample uses `8457B77A-D0304458-B136-8BB5335F4512` which must be changed to a new UUID of your choosing, in both  "Plug-in factory interfaces" and  "Plug-in types" entries.
