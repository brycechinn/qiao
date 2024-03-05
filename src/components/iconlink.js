import React from "react";
import lodash from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink } from "react-router-dom";

/**
 * @param {{
 *  icon?: import("@fortawesome/fontawesome-svg-core").IconProp;
 *  children?: any;
 * } & import("react-router-dom").NavLinkProps & React.RefAttributes<HTMLAnchorElement>} x 
 */
export default function IconLink(x) {
    var props = { ...x };
    props.className = "m-iconlink" + (x?.className ? (" " + x?.className) : "");
    return (
        <NavLink {...lodash.omit(props, ["icon", "children"])}>{props?.icon ? <FontAwesomeIcon icon={props?.icon} className="icon" style={{ marginRight: "8px" }} /> : ""}<div className={props?.icon ? "content" : "noicon-content"}>{props?.children}</div></NavLink>
    );
}