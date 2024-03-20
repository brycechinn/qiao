import {
  faBoltLightning,
  faBoxOpen,
  faCircleNotch,
  faGift,
  faUserGroup,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "./header.scss";
import IconLink from "./iconlink";
import Drawer from "./responsiveDrawer";
import SignupModalContent from "./signup/signupModal";
import LoginModalContent from "./signup/loginModal";
import { useState } from "react";
import { states } from "../app";
import { Portal } from "@mui/material";

export default function Header() {
  const [signupModalIsOpen, setSignupModalIsOpen] = useState(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [accountPopup, setAccountPopup] = useState(false);
  const [closing, setClosing] = useState(false);

  const openSignupModal = () => {
    setSignupModalIsOpen(true);
    setClosing(false);
  };

  const closeSignupModal = () => {
    setClosing(true);
    setTimeout(() => setSignupModalIsOpen(false), 500);
  };

  const openLoginModal = () => {
    setLoginModalIsOpen(true);
    setClosing(false);
  };

  const closeLoginModal = () => {
    setClosing(true);
    setTimeout(() => setLoginModalIsOpen(false), 500);
  };

  const toggleAccountPopup = (forcedValue) => {
    if (forcedValue === false || accountPopup === true) {
      if (accountPopup !== "closing" && accountPopup !== false) {
        setAccountPopup("closing");
        setTimeout(() => {
          setAccountPopup(false);
        }, 200);
      }
    } else if (forcedValue === true || accountPopup === false) {
      if (accountPopup !== "opening" && accountPopup !== true) {
        setAccountPopup("opening");
        setTimeout(() => {
          setAccountPopup(true);
        }, 1);
      }
    }
  };

  return (
    <div className="header" style={{ position: "fixed" }}>
      <IconLink className="logo" to="/">
        QIAO
      </IconLink>
      <div
        style={{
          height: "100%",
          width: "1px",
          background: "rgba(255, 255, 255, 0.5)",
          margin: "0 0.75rem",
        }}
      ></div>
      <Drawer className="links">
        {/* <IconLink className='link' to="/unboxing" icon={faBoxOpen}>UNBOXING</IconLink>
                <IconLink className='link' to="/pvp" icon={faBoltLightning}>BATTLES</IconLink>
                <IconLink className='link' to="/deals" icon={faCircleNotch}>DEALS</IconLink> */}
        {/* <IconLink className='link' to="/affiliates" icon={faUserGroup}>AFFILIATES</IconLink> */}
        {/* <IconLink className='link' to="/freedrop" icon={faGift}>FREE DROP</IconLink> */}
        <IconLink className="link" to="/contact" icon={faUserGroup}>CONTACT</IconLink>
      </Drawer>
      {states?.data?.user?.username ? (
        <div className="account-alt">
          <IconLink
            className="link"
            to="/account"
            onClick={(ev) => {
              ev.preventDefault();
              toggleAccountPopup();
            }}
            icon={faUser}
          >
            {states?.data?.user?.username}
          </IconLink>
        </div>
      ) : (
        <div className="account">
          <button className="signup" onClick={openSignupModal}>
            SIGN UP
          </button>
          {signupModalIsOpen && (
            <div className={`modal-overlay ${closing ? "closing" : ""}`}>
              <SignupModalContent onClose={closeSignupModal} />
            </div>
          )}
          <button className="login" onClick={openLoginModal}>
            LOGIN
          </button>
          {loginModalIsOpen && (
            <div className={`modal-overlay ${closing ? "closing" : ""}`}>
              <LoginModalContent onClose={closeLoginModal} />
            </div>
          )}
        </div>
      )}
      {(accountPopup === "opening" ||
        accountPopup === true ||
        accountPopup === "closing") && (
        <Portal>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: "10",
              transition: "opacity 200ms ease-in-out",
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              opacity:
                accountPopup === "opening"
                  ? 0
                  : accountPopup === true
                  ? 1
                  : accountPopup === "closing"
                  ? 0
                  : 0,
            }}
          >
            <div
              id="accountPopupOverlay"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                zIndex: "15",
              }}
              onClick={(e) => {
                console.log(e.currentTarget);
                if (e.currentTarget.id === "accountPopupOverlay") {
                  toggleAccountPopup(false);
                }
              }}
            >
              <div
                className="accountPopup"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  minWidth: "186px",
                  minHeight: "59px",
                  background: "rgb(50, 50, 50)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  transition: "transform 200ms ease-in-out, opacity 200ms ease-in-out",
                  transform:
                    accountPopup === "opening"
                      ? "translateY(-10px)"
                      : accountPopup === true
                      ? "translateY(0px)"
                      : accountPopup === "closing"
                      ? "translateY(-10px)"
                      : "translateY(-10px)",
                  opacity:
                    accountPopup === "opening"
                      ? 0
                      : accountPopup === true
                      ? 1
                      : accountPopup === "closing"
                      ? 0
                      : 0,
                }}
              >
                <div>
                  <IconLink
                    className="link"
                    style={{
                      marginLeft: "auto",
                      minWidth: "fit-content",
                      alignItems: "center",
                    }}
                    onClick={(ev) => {
                      ev.preventDefault();
                    }}
                    icon={faUser}
                  >
                    {states?.data?.user?.username}
                  </IconLink>
                </div>
                <button
                  id="logout"
                  className="noPadding"
                  onClick={async (event) => {
                    event.preventDefault();

                    const response = await fetch("/logout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });

                    if (response.ok) {
                      const data = await response.json();
                      if (response.status < 400) {
                        console.log("Logged out!");
                        document.location.reload();
                      } else {
                        console.log("Something went wrong!");
                      }
                    } else {
                      console.error("Failed to login user");
                    }
                  }}
                  style={{
                    width: "100%",
                    color: "white",
                  }}
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
