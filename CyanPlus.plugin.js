/**
* @name Cyan+
* @displayName Cyan+
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.4.0
*/
/*@cc_on
@if (@_jscript)
     
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you"ve mistakenly tried to run me directly. \n(Don"t do that!)", 0, "I"m a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I"m in the correct folder already.", 0, "I"m already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can"t find the BetterDiscord plugins folder.\nAre you sure it"s even installed?", 0, "Can"t install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord"s plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I"m installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/



let currentUserAccentColor;
let cyanUpdater;
let defaultSettings = {
    activeAddons: []
};
let userSettings = {};
let completeSettings = Object.assign(userSettings, defaultSettings, BdApi.loadData("CyanPlus", "settings"));
BdApi.saveData("CyanPlus", "settings", completeSettings);
module.exports = (() => {
    const config = {
        info: {
            name: "Cyan+",
            authors: [
                {
                    name: "DaBluLite",
                    discord_id: "582170007505731594",
                    github_username: "DaBluLite"
                }
            ],
            version: "1.4.0",
            description: "A plugin that allows for various Cyan features to work properly (When changing banner color on a non-nitro account, reload Discord or turn off and back on the plugin for the color to apply).",
            github: "https://github.com/DaBluLite/Cyan/blob/master/CyanPlus.plugin.js",
            github_raw: "https://github.com/DaBluLite/Cyan/raw/master/CyanPlus.plugin.js"
        }
    };
    
    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library plugin is needed", [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`], {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error)
                            return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {DOMTools, Utilities, WebpackModules, PluginUtilities, Popouts, DiscordModules: {LocaleManager: {Messages}, UserStatusStore, UserStore}} = Api;
            const Dispatcher = WebpackModules.getByProps("dispatch", "register");
            const Flux = Object.assign({}, WebpackModules.getByProps("Store", "connectStores"), WebpackModules.getByProps("useStateFromStores"));
            const SessionsStore = WebpackModules.getByProps("getSessions", "_dispatchToken");
 
            const {Webpack, Webpack: {Filters}, React} = BdApi;
            const { getUserProfile } = Webpack.getModule(Filters.byProps("getUserProfile"));
            const { field } = Webpack.getModule(Filters.byProps("field"));
            const [Toast, UnthemedProfiles, BannerSVG, {getCurrentUser}, UserArea] = Webpack.getBulk.apply(null, [
                Filters.byProps("createToast"),
                Filters.byProps("userProfileOuterUnthemed"),
                Filters.byProps("bannerSVGWrapper"),
                Filters.byProps("getUser"),
                Filters.byProps("panels")
            ].map(fn => ({filter: fn})));

            const UserProfile = Webpack.getModule((exports, module, index) => exports.toString?.().includes(".apply(this,arguments)") &&  Webpack.modules[index].toString().includes("USER_PROFILE_FETCH_START"), { searchExports: true });
            UserProfile(getCurrentUser().id).then(profile => {
                currentUserAccentColor = profile.user.banner_color;
            });
            
            let nativeToast = (text,type) => {
                let toast = Toast.createToast(text,type);
                Toast.showToast(toast);
            }

            let textInput = (placeholdr, idd) => {
                if(placeholdr) {
                    return createElement("input", {
                        type: "text",
                        class: "inputDefault-Ciwd-S input-3O04eu",
                        placeholder: placeholdr,
                        id: idd
                    })
                } else {
                    return createElement("input", {
                        type: "text",
                        class: "inputDefault-Ciwd-S input-3O04eu"
                    })
                }
            };

            let modalHeader = (text) => {
                return createElement("h2", {
                    class: "h5-2feg8J eyebrow-2wJAoF"
                },text);
            }

            let modalBtn = (text,options) => {
                options['class'] = "button-ejjZWC lookFilled-1H2Jvj colorBrand-2M3O3N sizeMedium-2oH5mg grow-2T4nbg cyanColorwayModalBtn";
                return createElement("button", options, text);
            }
            let modalBtnGray = (text,options) => {
                options['class'] = "button-ejjZWC lookFilled-1H2Jvj colorPrimary-2-Lusz sizeMedium-2oH5mg grow-2T4nbg cyanColorwayModalBtn";
                return createElement("button", options, text);
            }
            let betaBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--brand-500);"
                }, "Beta");
            }
            let alphaBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, "Alpha");
            }
            let versionBadge = (text,ver) => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, text + " V" + ver);
            }
            let primaryBadge = (text) => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--background-secondary);"
                }, text);
            }
            let unstableBadge = () => {
                return createElement("div", {
                    class: "textBadge-1fdDPJ base-3IDx3L eyebrow-132Xza baseShapeRound-3epLEv",
                    style: "background-color: var(--red-430);"
                }, "Unstable");
            }

            const Settings = new class Settings extends Flux.Store {
                constructor() {super(Dispatcher, {});}
                _settings = PluginUtilities.loadSettings(config.info.name, {});
 
                get(key, def) {
                    return this._settings[key] ?? def;
                }
 
                set(key, value) {
                    this._settings[key] = value;
                    this.emitChange();
                }
            };

            const StoreWatcher = {
                _stores: [Settings, UserStatusStore, UserStore, SessionsStore],
                _listeners: new Set,
                onChange(callback) {
                    this._listeners.add(callback);
                },
                offChange(callback) {
                    this._listeners.add(callback);
                },
                _alertListeners() {
                    StoreWatcher._listeners.forEach(l => l());
                },
                _init() {
                    this._stores.forEach(store => store.addChangeListener(this._alertListeners));
                },
                _stop() {
                    this._stores.forEach(store => store.addChangeListener(this._alertListeners));
                }
            };

            const createElement = (type, props, ...children) => {
                if (typeof type === "function") return type({...props, children: [].concat()})

                const node = document.createElement(type);

                for (const key of Object.keys(props)) {
                    if (key.indexOf("on") === 0) node.addEventListener(key.slice(2).toLowerCase(), props[key]);
                    else if (key === "children") {
                        node.append(...(Array.isArray(props[key]) ? props[key] : [].concat(props[key])));
                    } else {
                        node.setAttribute(key === "className" ? "class" : key, props[key]);
                    }
                }

                if (children.length) node.append(...children);

                node.getElementByClass = (clss) => {
                    return node.getElementsByClassName(clss)[0];
                }

                return node;
            };

            const bdSwitch = (status,options) => {
                let _checked;
                options['class'] = "bd-switch"
                this.switch = createElement("div", options);
                
                if(status==true) {
                    _checked = "checked";
                }

                this.switch.innerHTML = `<input type="checkbox" ${_checked}><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>`;
            
                return this.switch;
            }

            const bdSwitchReact = (status,options) => {
                let _checked;
                options['class'] = "bd-switch";
                if(status==true) {
                    _checked = "checked";
                }


                this.switch = React.createElement("div", options);

                this.switch.dangerouslySetInnerHTML(`<input type="checkbox" ${_checked}><div class="bd-switch-body"><svg class="bd-switch-slider" viewBox="0 0 28 20" preserveAspectRatio="xMinYMid meet"><rect class="bd-switch-handle" fill="white" x="4" y="0" height="20" width="20" rx="10"></rect><svg class="bd-switch-symbol" viewBox="0 0 20 20" fill="none"><path></path><path></path></svg></svg></div>`);
            
                return this.switch;
            }

            class SettingsRenderer {
                constructor(target) {
                    this.ref = null;
                    this.target = target;
                    this._destroyed = false;

                    target._patched = true;

                    this.container = createElement("div", {
                        className: Utilities.className("colorwaySettingsWrapper"),
                    },);

                    DOMTools.onRemoved(target, () => this.unmount());

                    StoreWatcher.onChange(this.handleChange);
                }

                unmount() {
                    this.ref?.remove();
                    this._destroyed = true;
                    StoreWatcher.offChange(this.handleChange);
                    this.target._patched = false;
                }

                mount() {
                    if (this._destroyed) return false;

                    const res = this.render();
                    if (!res) this.ref?.remove();
                    else {
                        if (this.ref) {
                            /*this.ref.replaceWith(res);*/
                        } else {
                            this.target.appendChild(res);
                        }
                        
                        this.ref = res;
                    }
                }

                handleChange = () => {
                    if (this._destroyed) return false;

                    if (this.state && _.isEqual(this.state, this.getState())) return;

                    this.mount();
                }

                getState() {
                    
                }

                render() {
                    const container = this.container.cloneNode(true);
                    const state = this.state = this.getState();

                    container._unmount = this.unmount.bind(this);

                    container.append(createElement("div",{class: "cyan-settings-header"},"Addons"));

                    fetch("https://dablulite.github.io/Cyan/Addons/index.json")
                    .then(res => res.json())
                    .then(data => {
                        let _addons = data.addons;
                        _addons.forEach(addon => {
                            let checked = false;
                            if(document.getElementById("cyan-addon-" + addon.name)) {
                                checked = true;
                            }
                            let cyanAddon = createElement("span",{
                                class: "cyan-addon"
                            },
                            createElement("span",{},addon.name),
                            bdSwitch(checked, {
                                onclick: (ev) => {
                                    if(ev.target.checked == false) {
                                        if(document.querySelector("bd-styles")) {
                                            try {
                                                document.getElementById("cyan-addon-" + addon.name).remove();
                                                let newAddons = [];
                                                BdApi.loadData("CyanPlus", "settings").activeAddons.forEach(pastAddon => {
                                                    newAddons.push(pastAddon);
                                                });
                                                if(BdApi.loadData("CyanPlus", "settings").activeAddons.includes("cyan-addon-" + addon.name)) {
                                                    const index = newAddons.indexOf("cyan-addon-" + addon.name);
                                                    if (index > -1) {
                                                        newAddons.splice(index, 1);
                                                    }
                                                }
                                                userSettings = {
                                                    activeAddons: newAddons
                                                }
                                                BdApi.saveData("CyanPlus", "settings", userSettings);
                                            } catch(e) {}
                                        }
                                    }
                                    if(ev.target.checked == true) {
                                        if(document.querySelector("bd-styles")) {
                                            if(!document.getElementById("cyan-addon-" + addon.name)) {
                                                document.querySelector("bd-styles").append(createElement("style", {
                                                    class: "cyan-addon-stylesheet",
                                                    id: "cyan-addon-" + addon.name
                                                },addon.import));
                                                let newAddons = [];
                                                BdApi.loadData("CyanPlus", "settings").activeAddons.forEach(pastAddon => {
                                                    newAddons.push(pastAddon);
                                                });
                                                if(!BdApi.loadData("CyanPlus", "settings").activeAddons.includes("cyan-addon-" + addon.name)) {
                                                    newAddons.push("cyan-addon-" + addon.name);
                                                }
                                                userSettings = {
                                                    activeAddons: newAddons
                                                }
                                                BdApi.saveData("CyanPlus", "settings", userSettings);
                                            }
                                        }
                                    }
                                }
                            })
                            )
                            container.append(cyanAddon);
                        })
                    })

                    return container;
                }
            }

            return class CyanPlus extends Plugin {
                cyanUpdateNotice = (_showToast) => {
                    if(getComputedStyle(document.body).getPropertyValue('--cyan-version')) {
                        if(_showToast == true) {
                            nativeToast("Checking For Updates",0);
                        }
                        fetch("https://dablulite.github.io/Cyan/import.css", {cache:"no-cache"})
                        .then(res => res.text())
                        .then(data => {
                            let cyanPatchVersion;
                            if(getComputedStyle(document.body).getPropertyValue('--cyan-patch-version').replace(" ","")) {
                                cyanPatchVersion = "." + getComputedStyle(document.body).getPropertyValue('--cyan-patch-version').replace(" ","");
                            } else {
                                cyanPatchVersion = ".0";
                            }
                            if(data.split("--cyan-version: ")[1].split(";")[0] + "." + data.split("--cyan-subversion: ")[1].split(";")[0] + "." + data.split("--cyan-patch-version: ")[1].split(";")[0] > getComputedStyle(document.body).getPropertyValue('--cyan-version').replace(" ","") + "." + getComputedStyle(document.body).getPropertyValue('--cyan-subversion').replace(" ","") + cyanPatchVersion) {
                                console.log("Cyan Update found, sending update notice");
                                if(!document.querySelector("#bd-notices")) {
                                    document.querySelector(".base-2jDfDU").insertAdjacentElement('afterbegin',createElement("div",{id:"bd-notices"}))
                                }
                                if(!document.querySelector("#cyan-update-notice")) {
                                    let cyanNotice = createElement("div",{
                                        class: "bd-notice",
                                        id: "cyan-update-notice"
                                    },
                                    createElement("div",{
                                        class: "bd-notice-close",
                                        onclick: (e) => {
                                            event.path[1].classList.add("bd-notice-closing");
                                            setTimeout(() => {
                                                e.path[1].remove();
                                            },300);
                                        }
                                    }),
                                    createElement("span",{
                                        class: "bd-notice-content"
                                    },"Cyan Update available (New: " + data.split("--cyan-version: ")[1].split(";")[0] + "." + data.split("--cyan-subversion: ")[1].split(";")[0] + "." + data.split("--cyan-patch-version: ")[1].split(";")[0] + ", Current: " + getComputedStyle(document.body).getPropertyValue('--cyan-version').replace(" ","") + "." + getComputedStyle(document.body).getPropertyValue('--cyan-subversion').replace(" ","") + cyanPatchVersion + "), reload Cyan to update."),
                                    createElement("button",{
                                        class: "bd-notice-button",
                                        onclick: (e) => {
                                            BdApi.Themes.getAll().forEach(theme => {
                                                if(theme.css.includes("@import url(https://dablulite.github.io/Cyan/import.css);")) {
                                                    BdApi.Themes.reload(theme.id);
                                                }
                                            })
                                            event.path[1].classList.add("bd-notice-closing");
                                            setTimeout(() => {
                                                e.path[1].remove();
                                            },300);
                                        }
                                    },"Reload Cyan")
                                    )
                                    document.querySelector("#bd-notices").append(cyanNotice);
                                }
                            } else {
                                if(_showToast == true) {
                                    nativeToast("You're up-to-date!",1);
                                }
                            }
                        })
                    }
                }
                css = `
                @import url(https://itmesarah.github.io/usrbg/usrbg.css);
                #profile-customization-tab .customizationSection-IGy2fS:has(.userProfileOuterUnthemed-11rPfA)::before {
                    content: none;
                }
                #Cyan-card .bd-description-wrap::after,
                #themes-tab > .bd-controls::after {
                    content: none;
                }


                /*Cyan+ Tags*/
                #profile-customization-tab .customizationSection-IGy2fS:has(.userProfileOuterUnthemed-11rPfA) h3::after {
                    content: "Cyan+";
                    padding: 2px 6px;
                    background-color: var(--background-secondary-alt);
                    border-radius: 16px;
                    margin-left: 4px;
                }
                .panelTitleContainer-bZ3AM_ {
                    margin-bottom: 6px;
                }
                .panelTitleContainer-bZ3AM_ > div {
                    overflow: visible;
                }
                .panelTitleContainer-bZ3AM_ > div::after {
                    content: "Cyan+";
                    padding: 1px 8px;
                    background-color: var(--cyan-background-primary);
                    border: 2px solid var(--cyan-accent-color);
                    border-radius: 16px;
                    margin-left: 4px;
                }
                .panels-3wFtMD {
                    box-shadow: none;
                    border-radius: 16px;
                    background-color: var(--cyan-accent-color);
                    position: relative;
                    background-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgb(0,0,0,.7) 100%);
                    padding: 4px;
                }
                .panels-3wFtMD::after {
                    content: "";
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: calc(100% - 8px);
                    height: calc(100% - 8px);
                    border-radius: 13px;
                    background-color: rgba(0,0,0,.4);
                    z-index: -1;
                }
                .field-21XZwa::after,
                .userInfo-regn9W > div:not([class])::after {
                    content: "";
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: calc(100% - 8px);
                    height: calc(100% - 8px);
                    border-radius: 13px;
                    background-color: rgba(0,0,0,.4);
                }
                .field-21XZwa {
                    border-radius: 16px;
                    background-color: var(--cyan-accent-color) !important;
                    position: relative;
                    background-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgb(0,0,0,.7) 100%);
                    padding: 16px;
                    border: none !important;
                }
                .userInfo-regn9W > div:not([class]) {
                    border-radius: 16px;
                    background-color: var(--cyan-accent-color) !important;
                    background-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgb(0,0,0,.7) 100%);
                    padding: 12px;
                    border: none !important;
                    padding-left: 100px;
                }
                .field-21XZwa > *,
                .userInfo-regn9W > div:not([class]) {
                    z-index: +1;
                }
                .avatar-3mTjvZ,
                .userInfo-regn9W > div:not([class]) > * {
                    z-index: +2;
                }
                .cyan-addon {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--header-secondary);
                    font-weight: 400;
                }
                #CyanPlusSettings {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .cyan-addon > span {
                    white-space: nowrap; 
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .cyan-settings-header {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    color: var(--header-primary);
                    font-weight: 600;
                }
                `;
                onStart() {
                    PluginUtilities.addStyle("CyanPlus", this.css);

                    StoreWatcher._init();

                    const elements = Array.from(document.body.getElementsByClassName(UnthemedProfiles?.userProfileInnerThemedNonPremium));
                    const settingsElement = Array.from(document.body.getElementsByClassName("accountProfileCard-lbN7n-"));
                    const panelsElement = Array.from(document.body.getElementsByClassName(UserArea?.panels));

                    if(settingsElement.length) {
                        settingsElement.forEach(elem => {
                            elem.style = elem.style + ";--cyan-accent-color: " + currentUserAccentColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + currentUserAccentColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                        })
                    }

                    if(panelsElement.length) {
                        panelsElement.forEach(elem => {
                            let styleLoop = setInterval(() => {
                                if(!currentUserAccentColor) {
                                    
                                } else {
                                    elem.style = elem.style + ";--cyan-accent-color: " + currentUserAccentColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + currentUserAccentColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                                    clearInterval(styleLoop);
                                }
                            },200);
                        })
                    }

                    if(elements.length) {
                        elements.forEach(elem => {
                            elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                        })
                    }

                    let cyanColorwaysButton = createElement("a", {
                        class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                        target: "_blank",
                        href: "https://dablulite.github.io/Cyan/Addons/CyanColorways/"
                    });
                    cyanColorwaysButton.innerHTML = `<div class="contents-3NembX">Get CyanColorways Addon</div>`;
                    this.cyanUpdateNotice(false);
                    cyanUpdater = setInterval(() => {
                        this.cyanUpdateNotice(false);
                    },300000);


                    fetch("https://dablulite.github.io/Cyan/Addons/index.json")
                    .then(res => res.json())
                    .then(data => {
                        let _addons = data.addons;
                        _addons.forEach(addon => {
                            if(document.querySelector("bd-styles")) {
                                if(!document.getElementById("cyan-addon-" + addon.name)) {
                                    BdApi.loadData("CyanPlus", "settings").activeAddons.forEach(pastAddon => {
                                        if("cyan-addon-" + addon.name == pastAddon) {
                                            document.querySelector("bd-styles").append(createElement("style", {
                                                class: "cyan-addon-stylesheet",
                                                id: "cyan-addon-" + addon.name
                                            },addon.import));
                                        }
                                    });
                                }
                            }
                        })
                    })
                }

                observer({addedNodes,removedNodes}) {
                    for (const added of addedNodes) {
                        if (added.nodeType === Node.TEXT_NODE) continue;

                        const elements = Array.from(added.getElementsByClassName(UnthemedProfiles?.userProfileInnerThemedNonPremium));
                        const settingsElement = Array.from(added.getElementsByClassName("accountProfileCard-lbN7n-"));
                        const panelsElement = Array.from(added.getElementsByClassName(UserArea?.panels));

                        if(settingsElement.length) {
                            settingsElement.forEach(elem => {
                                elem.style = elem.style + ";--cyan-accent-color: " + currentUserAccentColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + currentUserAccentColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                            })
                        }

                        if(panelsElement.length) {
                            panelsElement.forEach(elem => {
                                elem.style = elem.style + ";--cyan-accent-color: " + currentUserAccentColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + currentUserAccentColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                            })
                        }

                        if(elements.length) {
                            elements.forEach(elem => {
                                elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%); background: var(--cyan-accent-color) !important;";
                                if(getComputedStyle(elem).getPropertyValue('--u')) {
                                    if(elem.classList.contains("userPopoutInner-nv9Y92")) {
                                        elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%); background: var(--cyan-accent-color) !important;max-width: 340px;"
                                    }
                                    elem.querySelector("." + BannerSVG?.bannerSVGWrapper).style +=  `
                                    scale: 1 !important;
                                        scale: 1 !important;
                                        position: static !important;
                                        z-index: +1 !important;
                                        min-width: 322px !important;
                                        max-width: calc(100% - 18px) !important;
                                        min-height: 120px !important;
                                        max-height: 212px !important;
                                        margin-left: 9px !important;
                                        background-image: var(--u) !important;
                                        background-position: center !important;
                                        background-repeat: no-repeat !important;
                                        background-size: cover !important;
                                        margin-top: 9px !important;
                                    `;
                                    try {
                                        elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style = elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style + ";opacity: 0;";
                                    } catch(e) {}
                                    try {
                                        elem.querySelector(".avatarWrapperNormal-ahVUaC").style = elem.querySelector(".avatarWrapperNormal-ahVUaC").style + ";position: absolute !important; top: 76px;";
                                    } catch(e) {}
                                }
                            })
                        }

                        let addonsButton = createElement("button", {
                            class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                            ttype: "button",
                            onclick: () => {
                                BdApi.alert("Cyan+ Settings",React.createElement("div",{id:"cyanplus-settings-container"}));
                            }
                        },createElement("div",{class:"contents-3NembX"},"Cyan Addons"));

                        try {
                            if(added.querySelector("#cyanplus-settings-container"))
                                new SettingsRenderer(added.querySelector("#cyanplus-settings-container")).mount();
                        } catch(e) {}

                        let cyanColorwaysButton = createElement("button", {
                            class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                            type: "button",
                            onclick: () => {
                                this.cyanUpdateNotice(true);
                            }
                        },createElement("div",{class:"contents-3NembX"},"Check For Updates"));
    
                        try {
                            if(added.querySelector("#Cyan-card")) {
                                if(!added.querySelector("#Cyan-card .cyanAddonsBtn"))
                                    added.querySelector("#Cyan-card .bd-description-wrap").append(addonsButton,createElement("div",{
                                        class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                                        type: "button",
                                        onclick: () => {
                                            BdApi.Plugins.reload("Cyan+");
                                        }
                                    },"Reload Cyan+"),cyanColorwaysButton);
                            }
                        } catch(e) {}
                    }

                    if(!document.querySelector("bd-themes").innerHTML.includes("@import url(https://dablulite.github.io/Cyan/import.css);")) {
                        console.log("Cyan Not Detected");
                        try {
                            Array.from(document.getElementsByClassName("cyanAddonsBtn")).forEach(e => {
                                e.remove();
                            })
                        } catch(e) {}
                        try {
                            PluginUtilities.removeStyle("CyanPlus");
                        } catch(e) {}
                    } else {
                        if(!document.querySelector("style#CyanPlus")) {
                            PluginUtilities.addStyle("CyanPlus", this.css);
                            try {
                                if(added.querySelector("#Cyan-card")) {
                                    if(!added.querySelector("#Cyan-card .cyanAddonsBtn"))
                                        added.querySelector("#Cyan-card .bd-description-wrap").append(addonsButton,createElement("div",{
                                            class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                                            type: "button",
                                            onclick: () => {
                                                BdApi.Plugins.reload("Cyan+");
                                            }
                                        },"Reload Cyan+"),cyanColorwaysButton);
                                }
                            } catch(e) {}
                        }
                    }
                }

                onStop() {
                    StoreWatcher._stop();
                    StoreWatcher._listeners.clear();
                    PluginUtilities.removeStyle("CyanPlus");
                    const panelsElement = Array.from(document.body.getElementsByClassName(UserArea?.panels));

                    if(panelsElement.length) {
                        panelsElement.forEach(elem => {
                            elem.style = "";
                        })
                    }

                    try {
                        clearInterval(cyanUpdater);
                    } catch(e) {}
                    fetch("https://dablulite.github.io/Cyan/Addons/index.json")
                    .then(res => res.json())
                    .then(data => {
                        let _addons = data.addons;
                        _addons.forEach(addon => {
                            if(document.querySelector("bd-styles")) {
                                try {
                                    document.getElementById("cyan-addon-" + addon.name).remove();
                                } catch(e) {}
                            }
                        })
                    })
                }

                getSettingsPanel() {
                    let _container = createElement("div",{id: "CyanPlusSettings"});

                    let contain = createElement("div",{});

                    _container.append(contain);

                    new SettingsRenderer(contain).mount();

                    return _container;
                }
            };
        };
        return plugin(Plugin, Api);
        //@ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
