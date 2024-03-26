function log(msg) {
    //print("MACsimize6: " + msg);
}

var handleFullscreen = readConfig("handleFullscreen", true);
var handleMaximized = readConfig("handleMaximized", true);

const savedDesktops = {};

function getNextDesktopNumber() {
    log("Trying to find next desktop number " + workspace.currentDesktop);
    for (i = 0; i < workspace.desktops.length; i++) {
        desktop = workspace.desktops[i];
        log(desktop, workspace.currentDesktop);
        if (desktop == workspace.currentDesktop) {
            log("Found :" + desktop.name + " Number : " + i);
            return i + 1;
        }
    }
}

function moveToNewDesktop(window) {
    log("Creating new desktop with name : " | window.resourceName.toString());
    let newDesktopNumber = getNextDesktopNumber();

    workspace.createDesktop(newDesktopNumber, window.resourceName.toString());

    newDesktop = workspace.desktops[newDesktopNumber];

    savedDesktops[window.internalId.toString()] = window.desktops;
    log(JSON.stringify(savedDesktops))
    ds = [newDesktop]
    window.desktops = ds
    workspace.currentDesktop = newDesktop;
}

function sanitizeDesktops(desktops) {
    log("Sanitizing desktops: " + JSON.stringify(desktops))
    let sanitizedDesktops = desktops.filter(value => Object.keys(value).length !== 0);
    log("sanitizeDesktops: " + JSON.stringify(sanitizedDesktops))
    if (sanitizedDesktops.length < 1) {
        sanitizedDesktops = [workspace.desktops[0]];
    }
    return sanitizedDesktops
}

function restoreDesktop(window) {
    log("Restoring desktop for " + window.internalId);
    if (window.desktops[0].name == window.resourceName.toString()) {
        log("here")
        let currentDesktop = window.desktops[0];
        log(currentDesktop);
        if (window.internalId.toString() in savedDesktops ) {
            log("Found saved desktops for: " + window.internalId.toString())
            let desktops = sanitizeDesktops(savedDesktops[window.internalId.toString()])

            delete savedDesktops[window.internalId.toString()]
            log(JSON.stringify(savedDesktops))
            window.desktops = desktops;
            workspace.removeDesktop(currentDesktop);
            workspace.currentDesktop = window.desktops[0];
            workspace.raiseWindow(window);
        }

    }
}

function fullScreenChanged(window) {
    log("Window : " + window.internalId.toString() + " fullscreen : " + window.fullScreen);

    if (window.fullScreen) {
        moveToNewDesktop(window);
    } else {
        restoreDesktop(window);
    }
}

function maximizedStateChanged(window, mode) {
    log("Window : " + window.internalId.toString() + " maximized mode : " + mode);
    if (mode == 3) {
        moveToNewDesktop(window);
    } else {
        restoreDesktop(window);
    }
}

function install() {
    log("Installing handler for workspace window add");
    workspace.windowAdded.connect(window => {
        // Check if the window is normal
        if (window.normalWindow && window.fullScreenable && window.maximizable){
            log("Installing fullscreen and close handles for" + window.internalId.toString());
            if (handleMaximized) {
                window.maximizedAboutToChange.connect(function (mode) {
                    log(window.internalId.toString() + "maximized changed");
                    maximizedStateChanged(window, mode);
                });
            }
            if (handleFullscreen) {
                window.fullScreenChanged.connect(function () {
                    log(window.internalId.toString() + "fullscreen changed");
                    fullScreenChanged(window);
                });
            }
            window.closed.connect(function () {
                log(window.internalId.toString() + " closed");
                restoreDesktop(window);
            });
        }
    });
    log("Workspacke handler installed");
}


log("Initializing...");
install();
