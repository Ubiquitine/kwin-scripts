function log(msg) {
     //print("VDOnPrimary: " + msg);
}

var primaryOutputNumber = readConfig("primaryOutput", 0);
const primaryScreen = workspace.screens[primaryOutputNumber];

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
        window.desktops = [workspace.currentDesktop];
        log("Window " + window.internalId + " has been unpinned");
    }
}

function bindUpdate(window) {
    bind(window);
    update(window);
}

function updateAll() {
    workspace.windowList().forEach(update);
}

function main() {
    workspace.windowList().forEach(bind);
    updateAll();
    workspace.windowAdded.connect(bindUpdate);
    workspace.screensChanged.connect(updateAll)
}

main();
