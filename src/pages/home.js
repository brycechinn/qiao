import "./home.scss";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as hooks from "@uidotdev/usehooks";
import getSymbolFromCurrency from "currency-symbol-map";

export default function Home() {
    const d = hooks.useSet([
        { name: "BOX.1", price: 25.0, currency: "USD", type: "Super High Stakes" },
        { name: "BOX.2", price: 25.0, currency: "USD", type: "High Stakes" },
        { name: "BOX.3", price: 25.0, currency: "USD", type: "High Stakes" },
        { name: "BOX.4", price: 25.0, currency: "USD", type: "High Stakes" },
        { name: "BOX.5", price: 25.0, currency: "USD", type: "Medium Stakes" },
        { name: "BOX.6", price: 25.0, currency: "USD", type: "Medium Stakes" },
        { name: "BOX.7", price: 25.0, currency: "USD", type: "Medium Stakes" },
        { name: "BOX.8", price: 25.0, currency: "USD", type: "Low Stakes" },
        { name: "BOX.9", price: 25.0, currency: "USD", type: "Low Stakes" },
        { name: "BOX.10", price: 25.0, currency: "USD", type: "Low Stakes" },
    ]);

    return (
        <div style= {{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "16px",
        }}>
            {[...d.values()].map((v) => (
                <div
                    id="boxCard"
                    style={{
                        width: "100%",
                        background: "rgba(80, 80, 80)",
                        display: "flex",
                        flexDirection: "column",
                        padding: "16px",
                    }}
                >
                    <div id="hoverDetails">
                        <div
                            id="top"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                            }}
                        >
                            <div id="left">
                                <div
                                    id="title"
                                    style={{
                                        fontFamily: "Montserrat",
                                        color: "white",
                                        fontWeight: "900",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {v?.name}
                                </div>
                                <div
                                    id="type"
                                    style={{
                                        fontFamily: "Montserrat",
                                        color: "rgba(180, 180, 180)",
                                    }}
                                >
                                    {v?.type}
                                </div>
                            </div>
                            <div id="right">
                                <div
                                    id="price"
                                    style={{
                                        padding: "8px",
                                        background: "white",
                                    }}
                                >
                                    {getSymbolFromCurrency(v?.currency)}
                                    {(typeof v?.price === "number"
                                        ? v?.price
                                        : parseInt(v?.price)
                                    ).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div id="bottom">
                            <div
                                style={{
                                    fontFamily: "Montserrat",
                                    color: "white",
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                }}
                            >
                                open now
                            </div>
                        </div>
                    </div>
                    <div
                        id="presentation"
                        style={{
                            height: "100%",
                            minHeight: "300px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faBox}
                            style={{ fontSize: "128px", color: "white" }}
                        />
                    </div>
                    <div
                        id="bottom-content"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div id="left">
                            <div
                                id="title"
                                style={{
                                    fontFamily: "Montserrat",
                                    color: "white",
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                }}
                            >
                                {v?.name}
                            </div>
                            <div
                                id="type"
                                style={{
                                    fontFamily: "Montserrat",
                                    color: "rgba(180, 180, 180)",
                                }}
                            >
                                {v?.type}
                            </div>
                        </div>
                        <div id="right">
                            <div
                                id="price"
                                style={{ padding: "8px", background: "white" }}
                            >
                                {getSymbolFromCurrency(v?.currency)}
                                {(typeof v?.price === "number"
                                    ? v?.price
                                    : parseInt(v?.price)
                                ).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
