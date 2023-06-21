/**
* @name Cyan+
* @displayName Cyan+
* @authorId 582170007505731594
* @invite ZfPH6SDkMW
* @version 1.0.0
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
            version: "1.0.0",
            creatorVersion: "1.0.0",
            description: "A plugin that allows for various Cyan features to work properly."
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
            const [Toast, UnthemedProfiles, BannerSVG, BadgeList, ProfileBadges, AccountProfileCard] = Webpack.getBulk.apply(null, [
                Filters.byProps("createToast"),
                Filters.byProps("userProfileOuterUnthemed"),
                Filters.byProps("bannerSVGWrapper"),
                Filters.byProps("headerTop"),
                Filters.byProps("profileBadges"),
                Filters.byProps("accountProfileCard")
            ].map(fn => ({filter: fn})));
            
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

            return class cyanColorways extends Plugin {
                css = `
                div[aria-label="dablulite"] .profileBadges-2pItdR::after,
                #profile-customization-tab .customizationSection-IGy2fS:has(.userProfileOuterUnthemed-11rPfA)::before {
                    content: none;
                }
                #Cyan-card .bd-description-wrap::after {
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
                `;
                onStart() {
                    PluginUtilities.addStyle(config.info.name, this.css);

                    StoreWatcher._init();

                    const elements = Array.from(document.body.getElementsByClassName(UnthemedProfiles?.userProfileInnerThemedNonPremium));
                    const settingsElement = Array.from(document.body.getElementsByClassName(AccountProfileCard?.accountProfileCard));

                    if(settingsElement.length) {
                        settingsElement.forEach(elem => {
                            elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                        })
                    }

                    if(elements.length) {
                        elements.forEach(elem => {
                            elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                            if(elem.querySelector('img[src*="582170007505731594"]')) {
                                if(!elem.querySelectorAll(".cyanAuthorBadge").length) {
                                    let badge = createElement("a",{
                                        class: "anchor-1X4H4q anchorUnderlineOnHover-wiZFZ_ cyanAuthorBadge",
                                        target: "_blank",
                                        href: "https://dablulite.github.io/Cyan/",
                                        style: "width: 22px; height: 22px; display: flex; justify-content: center; align-items: center;"
                                    });
                                    badge.innerHTML = `<img alt=" " style="border-radius: 50%; width: 16px; height: 16px;" aria-hidden="true" src="https://cdn.discordapp.com/icons/997741561683120208/46dd2738d4e2212e5581c2a62f687aac.webp?size=22" class="profileBadge22-3GAYRy profileBadge-12r2Nm desaturate-_Twf3u">`;
                                    BdApi.UI.createTooltip(badge, "Author of Cyan", {});
                                    try {
                                        elem.querySelectorAll("." + ProfileBadges?.profileBadges).forEach(e => {
                                            e.append(badge);
                                        })
                                    } catch(e) {}
                                    try {
                                        elem.querySelectorAll("." + BadgeList?.badgeList).forEach(e => {
                                            e.append(badge);
                                        })
                                    } catch(e) {}
                                }
                            }
                        })
                    }

                    let addonsButton = createElement("a", {
                        class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                        target: "_blank",
                        href: "https://dablulite.github.io/Cyan/Addons"
                    });
                    addonsButton.innerHTML = `<div class="contents-3NembX">Get Addons for Cyan</div>`;

                    let cyanColorwaysButton = createElement("a", {
                        class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                        target: "_blank",
                        href: "https://dablulite.github.io/Cyan/Addons/CyanColorways/"
                    });
                    cyanColorwaysButton.innerHTML = `<div class="contents-3NembX">Get CyanColorways Addon</div>`;

                    try {
                        if(!added.querySelector("#Cyan-card .cyanAddonsBtn"))
                            document.getElementById("Cyan-card").querySelector(".bd-description-wrap").append(addonsButton);
                    } catch(e) {}

                    try {
                        if(!added.querySelector(".ColorwaySelectorWrapperContainer .cyanAddonsBtn"))
                            document.querySelector(".ColorwaySelectorWrapperContainer").append(cyanColorwaysButton);
                    } catch(e) {}
                }

                observer({addedNodes}) {
                    for (const added of addedNodes) {
                        if (added.nodeType === Node.TEXT_NODE) continue;

                        const elements = Array.from(added.getElementsByClassName(UnthemedProfiles?.userProfileInnerThemedNonPremium));
                        const settingsElement = Array.from(added.getElementsByClassName(AccountProfileCard?.accountProfileCard));

                        if(settingsElement.length) {
                            settingsElement.forEach(elem => {
                                elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                            })
                        }

                        if(elements.length) {
                            elements.forEach(elem => {
                                elem.style = elem.style + ";--cyan-accent-color: " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + "; --cyan-elevation-shadow: 0 0 0 1.5px " + elem.querySelector("." + BannerSVG?.bannerSVGWrapper + " > foreignObject > div[style]").style.backgroundColor + ", 0 2px 10px 0 rgb(0 0 0 / 60%);";
                                if(elem.querySelector('img[src*="582170007505731594"]')) {
                                    if(!elem.querySelectorAll(".cyanAuthorBadge").length) {
                                        let badge = createElement("a",{
                                            class: "anchor-1X4H4q anchorUnderlineOnHover-wiZFZ_ cyanAuthorBadge",
                                            target: "_blank",
                                            href: "https://dablulite.github.io/Cyan/",
                                            style: "width: 22px; height: 22px; display: flex; justify-content: center; align-items: center;"
                                        });
                                        badge.innerHTML = `<img alt=" " style="border-radius: 50%; width: 16px; height: 16px;" aria-hidden="true" src="https://cdn.discordapp.com/icons/997741561683120208/46dd2738d4e2212e5581c2a62f687aac.webp?size=22" class="profileBadge22-3GAYRy profileBadge-12r2Nm desaturate-_Twf3u">`;
                                        BdApi.UI.createTooltip(badge, "Author of Cyan", {});
                                        try {
                                            elem.querySelectorAll("." + ProfileBadges?.profileBadges).forEach(e => {
                                                e.append(badge);
                                            })
                                        } catch(e) {}
                                        try {
                                            elem.querySelectorAll("." + BadgeList?.badgeList).forEach(e => {
                                                e.append(badge);
                                            })
                                        } catch(e) {}
                                    }
                                }
                            })
                        }

                        let addonsButton = createElement("a", {
                            class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                            target: "_blank",
                            href: "https://dablulite.github.io/Cyan/Addons"
                        });
                        addonsButton.innerHTML = `<div class="contents-3NembX">Get Addons for Cyan</div>`;

                        let cyanColorwaysButton = createElement("a", {
                            class: "button-1d_47w button-ejjZWC lookFilled-1H2Jvj buttonColor-1u-3JF sizeSmall-3R2P2p fullWidth-3M-YBR grow-2T4nbg cyanAddonsBtn",
                            target: "_blank",
                            href: "https://dablulite.github.io/Cyan/Addons/CyanColorways/"
                        });
                        cyanColorwaysButton.innerHTML = `<div class="contents-3NembX">Get CyanColorways Addon</div>`;
    
                        try {
                            if(added.querySelector("#Cyan-card")) {
                                if(!added.querySelector("#Cyan-card .cyanAddonsBtn"))
                                    added.querySelector("#Cyan-card .bd-description-wrap").append(addonsButton);
                            }
                            if(added.querySelector(".ColorwaySelectorWrapperContainer")) {
                                if(!added.querySelector(".ColorwaySelectorWrapperContainer .cyanAddonsBtn"))
                                    added.querySelector(".ColorwaySelectorWrapperContainer").append(cyanColorwaysButton);
                            }
                        } catch(e) {}
                    }
                }

                onStop() {
                    StoreWatcher._stop();
                    StoreWatcher._listeners.clear();
                    PluginUtilities.removeStyle(config.info.name);
                }
            };
        };
        return plugin(Plugin, Api);
        //@ts-ignore
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
