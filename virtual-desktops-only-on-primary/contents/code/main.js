functaion log(msg) {
     //print("VDOnPrimary: " + msg);
}

var primaryOutputIndex = readConfig("primaryOutputIndex", 0);
const primaryScreen = workspace.screens[primaryOutputIndex];

function primaryOutputPresent() {
    if (workspace.screens.includes(primaryScreen)) {
        return true;
    }
    return false;
}

function bind(window) {
    window.outputChanged.connect(window, update);
    log("Window " + window.internalId + " has been bound");
}

function update(window) {
    var window = window || this;
    
    if (window.specialWindow || (!window.normalWindow && window.skipTaskbar)) {
        return;
    }

    var currentScreen = window.output;

    if (currentScreen != primaryScreen) {
        window.onAllDesktops = true;
        log("Window " + window.internalId + " has been pinned");
    } else if ( window.onAllDesktops ) {
        //window.desktops = [workspace.currentDesktop];
        window.onAllDesktops = false;
        log("Window " + window.internalId + " has been unpinned");
    }
}

function bindUpdate(window) {
    bind(window);
    update(window);
}

function updateAll() {
    if (!primaryOutputPresent) {
        log("Primary display is missing. Not updating.")
        return;
    }
    if (workspace.screens.length < 2) {
        log("There is only one display. Mot updating")
    }
    workspace.windowList().forEach(update);
}

function main() {
    workspace.windowList().forEach(bind);
    updateAll();
    workspace.windowAdded.connect(bindUpdate);
    workspace.screensChanged.connect(updateAll)
}

main();
