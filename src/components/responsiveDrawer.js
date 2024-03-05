import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useWindowSize } from "@uidotdev/usehooks";
import React from "react";
import lodash from "lodash";

/**
 * @param {{
 *  children?: any;
 *  className?: string;
 * }} x
 */
export default function Drawer(x) {
    const [open, altSetOpen] = React.useState("closed");
    var toggleDrawer = (bool) => {
        if (bool === true ? (bool === true && open === "closed") : open === "closed") {
            altSetOpen("true");
        } else if (bool === false ? (bool === false && open === "true") : open === "true") {
            altSetOpen("false");
            setTimeout(() => {
                altSetOpen("closed");
            }, 300);
        }
    };
    const window = useWindowSize();
    if (window.width >= 800 && open === "true") {
        toggleDrawer(false);
    }
    var props = { ...x };
    props.className =
        "responsiveShow drawer-content" +
        (x?.className ? " " + x?.className : "");
    return (
        <>
            <div className="drawer">
                <a
                    className="open-drawer m-iconlink link responsiveHide"
                    onClick={() => {
                        toggleDrawer();
                    }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </a>
                <div
                    style={{
                        position: "fixed",
                        top: "0px",
                        left: "0px",
                        height: "100%",
                        width: "100%",
                        pointerEvents: (open === "true" && "unset" || open === "closed" && "none")
                    }}
                    onClick={() => {
                        if(open === "true") {
                            toggleDrawer(false);
                        }
                    }}
                    className={"drawer-background" +
                        ((open === "closed" && " closed") ||
                            (open === "true" && " opened") ||
                            (open === "false" && " closing"))}
                ></div>
                <div
                    className={
                        props?.className +
                        ((open === "closed" && " closed") ||
                            (open === "true" && " opened") ||
                            (open === "false" && " closing"))
                    }
                >
                    <a
                        className="open-drawer m-iconlink link responsiveHide"
                        style={{
                            fontWeight: "100"
                        }}
                        onClick={() => {
                            toggleDrawer(false);
                        }}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </a>
                    {(Array.isArray(props?.children)
                        ? props?.children
                        : [props?.children]
                    ).map((v, i) => {
                        var t = lodash.merge(
                            {
                                props: {
                                    onClick() {
                                        if (!v?.props?.donotclose) {
                                            if(open === "true") {
                                                setTimeout(() => {
                                                    toggleDrawer(false);
                                                }, 100);
                                            }
                                        }
                                    },
                                },
                            },
                            v
                        );
                        if (t?.props?.donotclose) delete t.props.donotclose;
                        return <div key={`${i}`}>{t}</div>;
                    })}
                </div>
            </div>
        </>
    );
}
