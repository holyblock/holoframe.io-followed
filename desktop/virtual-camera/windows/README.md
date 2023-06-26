---
page_type: sample
description: "Demonstrates how to write a custom media source and driver package."
languages:
- cpp
products:
- windows
- windows-wdk
---

# SimpleMediaSource sample

This sample demonstrates how to create a custom media source and driver package that can be installed as a camera and produce frames.

For more information, see the accompanying documentation at [Frame Server Custom Media Source](https://docs.microsoft.com/windows-hardware/drivers/stream/frame-server-custom-media-source).

## Contents

- MediaSource - COM DLL project for the custom media source
- SimpleMediaSourceDriver - UMDF driver install package

## Dependencies

- Microsoft Visual Studio 2019 (Community 16.11.15, https://my.visualstudio.com/Downloads?q=visual%20studio%202019)
- Windows Driver Kit (Windows 11, version 21H2, 10.0.22000.1, https://docs.microsoft.com/en-us/windows-hardware/drivers/other-wdk-downloads)

## Installation

1. Build the solution. First change build target (drop down under the top bar) to Release and x64. Then right click on `SimpleMediaSource` in Solution Explorer -> Properties -> C/C++ -> General -> Additional Include Directories -> edit -> Add `C:\Users\[username]\[path to wil code]\wil\include`, where wil code can be downloaded from https://github.com/microsoft/wil/tree/3c00e7f1d8cf9930bbb8e5be3ef0df65c84e8928. And then right click on both `SimpleMediaSource` and `SimpleMediaSourceDriver` -> Properties -> C/C++ -> Code Generation -> Spectre Mitigation -> Disabled. Finally Build -> Build Solution.

2. Navigate to the output folder, e.g. Windows-driver-samples\general\SimpleMediaSource\x64\Release, and the driver package will be in a directory also called SimpleMediaSourceDriver. Check that the folder has `SimpleMediaSource.dll`, `simplemediasourcedriver.cat`, `SimpleMediaSourceDriver.dll`, and `SimpleMediaSourceDriver.inf`.

3. To use the camera driver in testing environment (without verified developer signature), follow https://appuals.com/how-to-fix-the-third-party-inf-doesnt-contain-digital-signature-information/ (Solution 3), shift Restart -> Troubleshoot -> Advanced options -> Startup settings -> Restart -> (enter bitlock key aka.ms/myrecoverykey) -> select 7 Disable driver signature enforcement.

4. Deploy the driver package with Device Manager. Press the icon for Add Drivers. Browse to the folder that contains the files above. Keep on clicking next to install.

5. In Device Manager, locate **SimpleMediaSource Capture Source**, under the Camera category. Try Zoom for the virtual camera. Or open the Microsoft Camera App, switch cameras if necessary until the camera is streaming from the SimpleMediaSource. You should see a scrolling black and white gradient.
