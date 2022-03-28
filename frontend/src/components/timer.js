import { prettifySeconds } from "../utils/utils";
import { useEffect, useMemo, useState } from "react";

function TimerComponent(props) {
    const [rebaseString, setRebaseString] = useState("");
    const currentTime = Math.floor(new Date().getTime() / 1000);
    const [calcTime, setCalcTime] = useState(props.depositTime - currentTime + 3600 * 24 * 3);
    // console.log('[kg] => depositTime: ', props.depositTime);
    // console.log('[kg] => currentTime: ', currentTime);

    useEffect(() => {
        const prettified = prettifySeconds(calcTime);
        setRebaseString(prettified !== "" ? prettified : "--");
    }, [calcTime]);

    useEffect(() => {
        let interval = null;
        if (calcTime > 0) {
            interval = setInterval(() => {
                setCalcTime(calcTime => calcTime - 1);
                const prettified = prettifySeconds(calcTime);
                setRebaseString(prettified !== "" ? prettified : "Not Locked");
            }, 1000);
        } else {
            // When the countdown goes negative, reload the app details and reinitialize the timer
            setRebaseString("Not Locked");
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [calcTime]);

    return (
        <h3>
            RemainTime:{" "}
            <span style={{ paddingLeft: "0px" }}>
                {calcTime ? (
                    calcTime > 0 ? (
                        <>
                            {rebaseString}&nbsp;
                        </>
                    ) : (
                        "Not Locked"
                    )
                ) : (
                    "---"
                )}
            </span>
        </h3>
    );
}

export default TimerComponent;
